import { Body, Controller, Get, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";
import { WorkstationsService } from "./workstations.service";
import { CreateWorkstationDto } from "./subculture.dto";

@Controller("workstations")
export class WorkstationsController {
  constructor(private readonly service: WorkstationsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.organizationId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.LAB_MANAGER)
  create(@Body() dto: CreateWorkstationDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.organizationId);
  }
}
