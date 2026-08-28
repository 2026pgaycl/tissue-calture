import { Body, Controller, Get, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";
import { PlantSpeciesService } from "./plant-species.service";
import { CreatePlantSpeciesDto } from "./reference-data.dto";

@Controller("plant-species")
export class PlantSpeciesController {
  constructor(private readonly service: PlantSpeciesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.organizationId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.LAB_MANAGER)
  create(@Body() dto: CreatePlantSpeciesDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.organizationId);
  }
}
