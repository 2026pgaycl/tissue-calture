import { Body, Controller, Param, Patch, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";
import { SubcultureSessionsService } from "./subculture-sessions.service";
import { CompleteSessionDto, StartSessionDto } from "./subculture.dto";

@Controller("subculture-sessions")
@Roles(Role.ADMIN, Role.LAB_MANAGER, Role.LAB_TECHNICIAN)
export class SubcultureSessionsController {
  constructor(private readonly service: SubcultureSessionsService) {}

  @Post()
  start(@Body() dto: StartSessionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.start(dto, user);
  }

  @Patch(":id/complete")
  complete(@Param("id") id: string, @Body() dto: CompleteSessionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.complete(id, dto, user.organizationId);
  }
}
