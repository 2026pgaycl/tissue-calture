import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AutoclaveLogDto, CreateMediaBatchDto } from "./media-prep.dto";
import { generateBarcode } from "../common/utils/barcode.util";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";

@Injectable()
export class MediaBatchesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.mediaBatch.findMany({ where: { organizationId }, orderBy: { preparedAt: "desc" } });
  }

  async findOne(id: string, organizationId: string) {
    const batch = await this.prisma.mediaBatch.findFirst({ where: { id, organizationId } });
    if (!batch) throw new NotFoundException("Media batch not found");
    return batch;
  }

  /** Creates the media batch and deducts each recipe component from chemical stock, atomically. */
  async create(dto: CreateMediaBatchDto, user: AuthenticatedUser) {
    const recipe = await this.prisma.mediaRecipe.findFirst({
      where: { id: dto.recipeId, organizationId: user.organizationId },
      include: { components: { include: { chemical: true } } },
    });
    if (!recipe) throw new NotFoundException("Recipe not found");

    const required = recipe.components.map((component) => ({
      chemicalId: component.chemicalId,
      chemicalName: component.chemical.name,
      qty:
        (Number(component.concentration) * dto.targetVolumeL) /
        Number(component.chemical.stockConcentration),
      available: Number(component.chemical.currentStockQty),
    }));
    const insufficient = required.filter((r) => r.available < r.qty);
    if (insufficient.length > 0) {
      throw new BadRequestException({
        message: "Insufficient chemical stock for this batch",
        insufficient,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const mediaBatch = await tx.mediaBatch.create({
        data: {
          organizationId: user.organizationId,
          barcode: generateBarcode("MED"),
          recipeId: dto.recipeId,
          targetVolumeL: dto.targetVolumeL,
          expirationDate: new Date(dto.expirationDate),
          preparedById: user.id,
        },
      });

      for (const r of required) {
        await tx.chemical.update({
          where: { id: r.chemicalId },
          data: { currentStockQty: { decrement: r.qty } },
        });
        await tx.inventoryTransaction.create({
          data: {
            organizationId: user.organizationId,
            chemicalId: r.chemicalId,
            transactionType: "DEDUCTION",
            quantity: r.qty,
            relatedMediaBatchId: mediaBatch.id,
            operatorId: user.id,
          },
        });
      }

      return mediaBatch;
    });
  }

  async logAutoclave(id: string, dto: AutoclaveLogDto, user: AuthenticatedUser) {
    await this.findOne(id, user.organizationId);
    return this.prisma.$transaction(async (tx) => {
      const log = await tx.autoclaveLog.create({
        data: {
          organizationId: user.organizationId,
          mediaBatchId: id,
          cycleDate: new Date(dto.cycleDate),
          temperatureC: dto.temperatureC,
          pressureKpa: dto.pressureKpa,
          durationMin: dto.durationMin,
          operatorId: user.id,
          result: dto.result,
        },
      });
      await tx.mediaBatch.update({
        where: { id },
        data: { status: dto.result === "PASS" ? "AVAILABLE" : "FAILED_AUTOCLAVE" },
      });
      return log;
    });
  }
}
