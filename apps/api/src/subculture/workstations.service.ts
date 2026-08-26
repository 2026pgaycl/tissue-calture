import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateWorkstationDto } from "./subculture.dto";

@Injectable()
export class WorkstationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.workstation.findMany({ orderBy: { name: "asc" } });
  }

  create(dto: CreateWorkstationDto) {
    return this.prisma.workstation.create({ data: dto });
  }
}
