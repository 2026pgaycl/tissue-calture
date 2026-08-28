import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";
import { MediaBatchesService } from "./media-batches.service";
import { AutoclaveLogDto, CreateMediaBatchDto } from "./media-prep.dto";

@Controller("media-batches")
export class MediaBatchesController {
  constructor(private readonly mediaBatchesService: MediaBatchesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.mediaBatchesService.findAll(user.organizationId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.mediaBatchesService.findOne(id, user.organizationId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.LAB_MANAGER, Role.MEDIA_PREP_STAFF)
  create(@Body() dto: CreateMediaBatchDto, @CurrentUser() user: AuthenticatedUser) {
    return this.mediaBatchesService.create(dto, user);
  }

  @Post(":id/autoclave-log")
  @Roles(Role.ADMIN, Role.LAB_MANAGER, Role.MEDIA_PREP_STAFF)
  logAutoclave(
    @Param("id") id: string,
    @Body() dto: AutoclaveLogDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.mediaBatchesService.logAutoclave(id, dto, user);
  }
}
