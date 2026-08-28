import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePlantSpeciesDto } from "./reference-data.dto";

@Injectable()
export class PlantSpeciesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.plantSpecies.findMany({ where: { organizationId }, orderBy: { name: "asc" } });
  }

  create(dto: CreatePlantSpeciesDto, organizationId: string) {
    return this.prisma.plantSpecies.create({ data: { ...dto, organizationId } });
  }
}
