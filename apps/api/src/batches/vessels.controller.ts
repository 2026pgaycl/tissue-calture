import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";
import { VesselsService } from "./vessels.service";
import { CreateVesselDto, UpdateVesselStatusDto } from "./batches.dto";

@Controller("vessels")
export class VesselsController {
  constructor(private readonly vesselsService: VesselsService) {}

  // Static/nested paths must be declared before ":id" so they aren't swallowed by it.
  @Get("lookup/:barcode")
  findByBarcode(@Param("barcode") barcode: string, @CurrentUser() user: AuthenticatedUser) {
    return this.vesselsService.findByBarcode(barcode, user.organizationId);
  }

  @Get(":id/history")
  history(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.vesselsService.history(id, user.organizationId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.vesselsService.findOne(id, user.organizationId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.LAB_MANAGER, Role.LAB_TECHNICIAN)
  create(@Body() dto: CreateVesselDto, @CurrentUser() user: AuthenticatedUser) {
    return this.vesselsService.create(dto, user.organizationId);
  }

  @Patch(":id/status")
  @Roles(Role.ADMIN, Role.LAB_MANAGER, Role.LAB_TECHNICIAN)
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateVesselStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vesselsService.updateStatus(id, dto, user.organizationId);
  }
}
