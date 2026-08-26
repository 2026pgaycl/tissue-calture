import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateContaminationEventDto } from "./qc.dto";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";

export interface ContaminationEventFilters {
  contaminationType?: string;
  mediaBatchId?: string;
  workstationId?: string;
  locationId?: string;
}

@Injectable()
export class ContaminationEventsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: ContaminationEventFilters) {
    const where: Prisma.ContaminationEventWhereInput = {
      ...(filters.contaminationType
        ? { contaminationType: filters.contaminationType as Prisma.ContaminationEventWhereInput["contaminationType"] }
        : {}),
      ...(filters.mediaBatchId ? { mediaBatchId: filters.mediaBatchId } : {}),
      ...(filters.workstationId ? { workstationId: filters.workstationId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
    };
    return this.prisma.contaminationEvent.findMany({ where, orderBy: { detectedAt: "desc" } });
  }

  async create(dto: CreateContaminationEventDto, user: AuthenticatedUser) {
    const vessel = await this.prisma.vessel.findUnique({ where: { id: dto.vesselId } });
    if (!vessel) throw new NotFoundException("Vessel not found");

    return this.prisma.$transaction(async (tx) => {
      const event = await tx.contaminationEvent.create({
        data: { ...dto, detectedById: user.id },
      });
      await tx.vessel.update({
        where: { id: dto.vesselId },
        data: { status: dto.actionTaken === "DISCARDED" ? "DISCARDED" : "CONTAMINATED" },
      });
      return event;
    });
  }
}
