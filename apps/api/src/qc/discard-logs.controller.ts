import { Body, Controller, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";
import { DiscardLogsService } from "./discard-logs.service";
import { CreateDiscardLogDto } from "./qc.dto";

@Controller("discard-logs")
@Roles(Role.ADMIN, Role.LAB_MANAGER, Role.LAB_TECHNICIAN)
export class DiscardLogsController {
  constructor(private readonly service: DiscardLogsService) {}

  @Post()
  create(@Body() dto: CreateDiscardLogDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user);
  }
}
