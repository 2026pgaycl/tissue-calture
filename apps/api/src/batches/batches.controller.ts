import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";
import { BatchesService } from "./batches.service";
import { CreateBatchDto } from "./batches.dto";

@Controller("batches")
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("speciesId") speciesId?: string,
    @Query("stage") stage?: string,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    return this.batchesService.findAll(user.organizationId, {
      speciesId,
      stage,
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get(":id/lineage")
  lineage(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.batchesService.lineage(id, user.organizationId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.batchesService.findOne(id, user.organizationId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.LAB_MANAGER, Role.LAB_TECHNICIAN)
  create(@Body() dto: CreateBatchDto, @CurrentUser() user: AuthenticatedUser) {
    return this.batchesService.create(dto, user);
  }
}
