import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePlantSpeciesDto } from "./reference-data.dto";

@Injectable()
export class PlantSpeciesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.plantSpecies.findMany({ orderBy: { name: "asc" } });
  }

  create(dto: CreatePlantSpeciesDto) {
    return this.prisma.plantSpecies.create({ data: dto });
  }
}
