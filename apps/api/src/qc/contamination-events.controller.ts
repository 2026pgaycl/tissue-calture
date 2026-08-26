import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";
import { ContaminationEventsService } from "./contamination-events.service";
import { CreateContaminationEventDto } from "./qc.dto";

@Controller("contamination-events")
@Roles(Role.ADMIN, Role.LAB_MANAGER, Role.LAB_TECHNICIAN)
export class ContaminationEventsController {
  constructor(private readonly service: ContaminationEventsService) {}

  @Get()
  findAll(
    @Query("contaminationType") contaminationType?: string,
    @Query("mediaBatchId") mediaBatchId?: string,
    @Query("workstationId") workstationId?: string,
    @Query("locationId") locationId?: string,
  ) {
    return this.service.findAll({ contaminationType, mediaBatchId, workstationId, locationId });
  }

  @Post()
  create(@Body() dto: CreateContaminationEventDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user);
  }
}
