import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLocationDto } from "./reference-data.dto";

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.location.findMany({ where: { organizationId }, orderBy: { name: "asc" } });
  }

  create(dto: CreateLocationDto, organizationId: string) {
    return this.prisma.location.create({ data: { ...dto, organizationId } });
  }
}
