import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDiscardLogDto } from "./qc.dto";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";

@Injectable()
export class DiscardLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDiscardLogDto, user: AuthenticatedUser) {
    const vessel = await this.prisma.vessel.findFirst({
      where: { id: dto.vesselId, organizationId: user.organizationId },
    });
    if (!vessel) throw new NotFoundException("Vessel not found");

    return this.prisma.$transaction(async (tx) => {
      const log = await tx.discardLog.create({
        data: { ...dto, organizationId: user.organizationId, discardedById: user.id },
      });
      await tx.vessel.update({ where: { id: dto.vesselId }, data: { status: "DISCARDED" } });
      return log;
    });
  }
}
