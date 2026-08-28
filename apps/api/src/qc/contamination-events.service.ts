import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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

  findAll(organizationId: string, filters: ContaminationEventFilters) {
    const where: Prisma.ContaminationEventWhereInput = {
      organizationId,
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
    const vessel = await this.prisma.vessel.findFirst({
      where: { id: dto.vesselId, organizationId: user.organizationId },
    });
    if (!vessel) throw new NotFoundException("Vessel not found");

    const location = await this.prisma.location.findFirst({
      where: { id: dto.locationId, organizationId: user.organizationId },
    });
    if (!location) throw new BadRequestException("Location not found");

    if (dto.mediaBatchId) {
      const mediaBatch = await this.prisma.mediaBatch.findFirst({
        where: { id: dto.mediaBatchId, organizationId: user.organizationId },
      });
      if (!mediaBatch) throw new BadRequestException("Media batch not found");
    }
    if (dto.workstationId) {
      const workstation = await this.prisma.workstation.findFirst({
        where: { id: dto.workstationId, organizationId: user.organizationId },
      });
      if (!workstation) throw new BadRequestException("Workstation not found");
    }

    return this.prisma.$transaction(async (tx) => {
      const event = await tx.contaminationEvent.create({
        data: { ...dto, organizationId: user.organizationId, detectedById: user.id },
      });
      await tx.vessel.update({
        where: { id: dto.vesselId },
        data: { status: dto.actionTaken === "DISCARDED" ? "DISCARDED" : "CONTAMINATED" },
      });
      return event;
    });
  }
}
