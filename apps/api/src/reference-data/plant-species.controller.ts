import { Body, Controller, Get, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { PlantSpeciesService } from "./plant-species.service";
import { CreatePlantSpeciesDto } from "./reference-data.dto";

@Controller("plant-species")
export class PlantSpeciesController {
  constructor(private readonly service: PlantSpeciesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Roles(Role.ADMIN, Role.LAB_MANAGER)
  create(@Body() dto: CreatePlantSpeciesDto) {
    return this.service.create(dto);
  }
}
