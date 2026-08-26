import { Injectable, NotFoundException } from "@nestjs/common";
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

  async findAll(filters: BatchListFilters) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 25;
    const where: Prisma.BatchWhereInput = {
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

  async findOne(id: string) {
    const batch = await this.prisma.batch.findUnique({ where: { id } });
    if (!batch) throw new NotFoundException("Batch not found");
    return batch;
  }

  create(dto: CreateBatchDto, user: AuthenticatedUser) {
    return this.prisma.batch.create({
      data: {
        speciesId: dto.speciesId,
        stage: dto.stage,
        parentBatchId: dto.parentBatchId,
        sourceType: dto.sourceType,
        createdById: user.id,
      },
    });
  }

  /** Full ancestor + descendant tree via recursive CTE (see docs/02-database-schema.md). */
  async lineage(id: string) {
    await this.findOne(id);
    return this.prisma.$queryRaw`
      WITH RECURSIVE ancestors AS (
        SELECT * FROM batches WHERE id = ${id}::uuid
        UNION ALL
        SELECT b.* FROM batches b INNER JOIN ancestors a ON b.id = a.parent_batch_id
      ),
      descendants AS (
        SELECT * FROM batches WHERE id = ${id}::uuid
        UNION ALL
        SELECT b.* FROM batches b INNER JOIN descendants d ON b.parent_batch_id = d.id
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
