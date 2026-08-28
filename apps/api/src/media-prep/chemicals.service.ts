import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AdjustStockDto, CreateChemicalDto } from "./media-prep.dto";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";

@Injectable()
export class ChemicalsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.chemical.findMany({ where: { organizationId }, orderBy: { name: "asc" } });
  }

  create(dto: CreateChemicalDto, organizationId: string) {
    return this.prisma.chemical.create({
      data: { ...dto, organizationId, currentStockQty: dto.currentStockQty ?? 0 },
    });
  }

  async adjustStock(id: string, dto: AdjustStockDto, user: AuthenticatedUser) {
    const chemical = await this.prisma.chemical.findFirst({
      where: { id, organizationId: user.organizationId },
    });
    if (!chemical) throw new NotFoundException("Chemical not found");

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.chemical.update({
        where: { id },
        data: { currentStockQty: { increment: dto.quantity } },
      });
      await tx.inventoryTransaction.create({
        data: {
          organizationId: user.organizationId,
          chemicalId: id,
          transactionType: dto.quantity >= 0 ? "RECEIPT" : "ADJUSTMENT",
          quantity: dto.quantity,
          operatorId: user.id,
        },
      });
      return updated;
    });
  }

  lowStock(organizationId: string) {
    return this.prisma.$queryRaw`
      SELECT
        id, name, category, stock_concentration AS "stockConcentration", unit,
        current_stock_qty AS "currentStockQty", reorder_threshold AS "reorderThreshold", supplier
      FROM chemicals
      WHERE current_stock_qty <= reorder_threshold AND organization_id = ${organizationId}::uuid
      ORDER BY name ASC;
    `;
  }
}
