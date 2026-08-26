import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { VesselsService } from "./vessels.service";
import { CreateVesselDto, UpdateVesselStatusDto } from "./batches.dto";

@Controller("vessels")
export class VesselsController {
  constructor(private readonly vesselsService: VesselsService) {}

  // Static/nested paths must be declared before ":id" so they aren't swallowed by it.
  @Get("lookup/:barcode")
  findByBarcode(@Param("barcode") barcode: string) {
    return this.vesselsService.findByBarcode(barcode);
  }

  @Get(":id/history")
  history(@Param("id") id: string) {
    return this.vesselsService.history(id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.vesselsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.LAB_MANAGER, Role.LAB_TECHNICIAN)
  create(@Body() dto: CreateVesselDto) {
    return this.vesselsService.create(dto);
  }

  @Patch(":id/status")
  @Roles(Role.ADMIN, Role.LAB_MANAGER, Role.LAB_TECHNICIAN)
  updateStatus(@Param("id") id: string, @Body() dto: UpdateVesselStatusDto) {
    return this.vesselsService.updateStatus(id, dto);
  }
}
