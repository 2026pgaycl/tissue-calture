import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLocationDto } from "./reference-data.dto";

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.location.findMany({ orderBy: { name: "asc" } });
  }

  create(dto: CreateLocationDto) {
    return this.prisma.location.create({ data: dto });
  }
}
