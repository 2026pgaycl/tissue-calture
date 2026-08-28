import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBatchDto } from "./batches.dto";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";

export interface BatchListFilters {
  speciesId?: string;
  stage?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, filters: BatchListFilters) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 25;
    const where: Prisma.BatchWhereInput = {
      organizationId,
      ...(filters.speciesId ? { speciesId: filters.speciesId } : {}),
      ...(filters.stage ? { stage: filters.stage as Prisma.BatchWhereInput["stage"] } : {}),
      ...(filters.status ? { status: filters.status as Prisma.BatchWhereInput["status"] } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.batch.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.batch.count({ where }),
    ]);
    return { data, meta: { total, page, pageSize } };
  }

  async findOne(id: string, organizationId: string) {
    const batch = await this.prisma.batch.findFirst({ where: { id, organizationId } });
    if (!batch) throw new NotFoundException("Batch not found");
    return batch;
  }

  async create(dto: CreateBatchDto, user: AuthenticatedUser) {
    const species = await this.prisma.plantSpecies.findFirst({
      where: { id: dto.speciesId, organizationId: user.organizationId },
    });
    if (!species) throw new BadRequestException("Species not found");

    if (dto.parentBatchId) {
      const parent = await this.prisma.batch.findFirst({
        where: { id: dto.parentBatchId, organizationId: user.organizationId },
      });
      if (!parent) throw new BadRequestException("Parent batch not found");
    }

    return this.prisma.batch.create({
      data: {
        organizationId: user.organizationId,
        speciesId: dto.speciesId,
        stage: dto.stage,
        parentBatchId: dto.parentBatchId,
        sourceType: dto.sourceType,
        createdById: user.id,
      },
    });
  }

  /** Full ancestor + descendant tree via recursive CTE (see docs/02-database-schema.md). */
  async lineage(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.$queryRaw`
      WITH RECURSIVE ancestors AS (
        SELECT * FROM batches WHERE id = ${id}::uuid AND organization_id = ${organizationId}::uuid
        UNION ALL
        SELECT b.* FROM batches b
        INNER JOIN ancestors a ON b.id = a.parent_batch_id AND b.organization_id = a.organization_id
      ),
      descendants AS (
        SELECT * FROM batches WHERE id = ${id}::uuid AND organization_id = ${organizationId}::uuid
        UNION ALL
        SELECT b.* FROM batches b
        INNER JOIN descendants d ON b.parent_batch_id = d.id AND b.organization_id = d.organization_id
      ),
      tree AS (
        SELECT * FROM ancestors
        UNION
        SELECT * FROM descendants
      )
      SELECT
        id, parent_batch_id AS "parentBatchId", species_id AS "speciesId",
        stage, source_type AS "sourceType", status, created_by AS "createdById",
        created_at AS "createdAt", updated_at AS "updatedAt"
      FROM tree
      ORDER BY created_at ASC;
    `;
  }
}
