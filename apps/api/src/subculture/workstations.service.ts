import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateWorkstationDto } from "./subculture.dto";

@Injectable()
export class WorkstationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.workstation.findMany({ where: { organizationId }, orderBy: { name: "asc" } });
  }

  create(dto: CreateWorkstationDto, organizationId: string) {
    return this.prisma.workstation.create({ data: { ...dto, organizationId } });
  }
}
