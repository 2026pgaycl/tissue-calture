import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";
import { ChemicalsService } from "./chemicals.service";
import { AdjustStockDto, CreateChemicalDto } from "./media-prep.dto";

@Controller()
export class ChemicalsController {
  constructor(private readonly chemicalsService: ChemicalsService) {}

  @Get("chemicals")
  findAll() {
    return this.chemicalsService.findAll();
  }

  @Get("inventory/low-stock")
  lowStock() {
    return this.chemicalsService.lowStock();
  }

  @Post("chemicals")
  @Roles(Role.ADMIN, Role.LAB_MANAGER, Role.MEDIA_PREP_STAFF)
  create(@Body() dto: CreateChemicalDto) {
    return this.chemicalsService.create(dto);
  }

  @Patch("chemicals/:id/stock")
  @Roles(Role.ADMIN, Role.LAB_MANAGER, Role.MEDIA_PREP_STAFF)
  adjustStock(
    @Param("id") id: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.chemicalsService.adjustStock(id, dto, user);
  }
}
