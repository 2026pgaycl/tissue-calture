import { Body, Controller, Get, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { WorkstationsService } from "./workstations.service";
import { CreateWorkstationDto } from "./subculture.dto";

@Controller("workstations")
export class WorkstationsController {
  constructor(private readonly service: WorkstationsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Roles(Role.ADMIN, Role.LAB_MANAGER)
  create(@Body() dto: CreateWorkstationDto) {
    return this.service.create(dto);
  }
}
