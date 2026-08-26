import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AdjustStockDto, CreateChemicalDto } from "./media-prep.dto";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";

@Injectable()
export class ChemicalsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.chemical.findMany({ orderBy: { name: "asc" } });
  }

  create(dto: CreateChemicalDto) {
    return this.prisma.chemical.create({
      data: { ...dto, currentStockQty: dto.currentStockQty ?? 0 },
    });
  }

  async adjustStock(id: string, dto: AdjustStockDto, user: AuthenticatedUser) {
    const chemical = await this.prisma.chemical.findUnique({ where: { id } });
    if (!chemical) throw new NotFoundException("Chemical not found");

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.chemical.update({
        where: { id },
        data: { currentStockQty: { increment: dto.quantity } },
      });
      await tx.inventoryTransaction.create({
        data: {
          chemicalId: id,
          transactionType: dto.quantity >= 0 ? "RECEIPT" : "ADJUSTMENT",
          quantity: dto.quantity,
          operatorId: user.id,
        },
      });
      return updated;
    });
  }

  lowStock() {
    return this.prisma.$queryRaw`
      SELECT
        id, name, category, stock_concentration AS "stockConcentration", unit,
        current_stock_qty AS "currentStockQty", reorder_threshold AS "reorderThreshold", supplier
      FROM chemicals
      WHERE current_stock_qty <= reorder_threshold
      ORDER BY name ASC;
    `;
  }
}
