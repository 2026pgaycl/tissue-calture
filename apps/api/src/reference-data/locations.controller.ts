import { Body, Controller, Get, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";
import { LocationsService } from "./locations.service";
import { CreateLocationDto } from "./reference-data.dto";

@Controller("locations")
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.organizationId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.LAB_MANAGER)
  create(@Body() dto: CreateLocationDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.organizationId);
  }
}
