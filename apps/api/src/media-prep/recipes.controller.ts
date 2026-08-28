import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";
import { RecipesService } from "./recipes.service";
import { CalculateRecipeDto, CreateRecipeDto } from "./media-prep.dto";

@Controller("recipes")
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.recipesService.findAll(user.organizationId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.recipesService.findOne(id, user.organizationId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.LAB_MANAGER, Role.MEDIA_PREP_STAFF)
  create(@Body() dto: CreateRecipeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.recipesService.create(dto, user.id, user.organizationId);
  }

  @Post(":id/calculate")
  @Roles(Role.ADMIN, Role.LAB_MANAGER, Role.MEDIA_PREP_STAFF)
  calculate(@Param("id") id: string, @Body() dto: CalculateRecipeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.recipesService.calculate(id, dto, user.organizationId);
  }
}
