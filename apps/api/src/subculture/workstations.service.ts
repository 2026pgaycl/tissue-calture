import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateWorkstationDto } from "./subculture.dto";

@Injectable()
export class WorkstationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.workstation.findMany({ where: { organizationId }, orderBy: { name: "asc" } });
  }

  async create(dto: CreateWorkstationDto, organizationId: string) {
    const location = await this.prisma.location.findFirst({
      where: { id: dto.locationId, organizationId },
    });
    if (!location) throw new BadRequestException("Location not found");

    return this.prisma.workstation.create({ data: { ...dto, organizationId } });
  }
}
