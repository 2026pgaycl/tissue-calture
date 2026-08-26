import { Body, Controller, Get, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { LocationsService } from "./locations.service";
import { CreateLocationDto } from "./reference-data.dto";

@Controller("locations")
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Roles(Role.ADMIN, Role.LAB_MANAGER)
  create(@Body() dto: CreateLocationDto) {
    return this.service.create(dto);
  }
}
