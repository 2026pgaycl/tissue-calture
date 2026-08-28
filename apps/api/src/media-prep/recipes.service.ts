import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CalculateRecipeDto, CreateRecipeDto } from "./media-prep.dto";

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.mediaRecipe.findMany({
      where: { organizationId },
      include: { components: { include: { chemical: true } } },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string, organizationId: string) {
    const recipe = await this.prisma.mediaRecipe.findFirst({
      where: { id, organizationId },
      include: { components: { include: { chemical: true } } },
    });
    if (!recipe) throw new NotFoundException("Recipe not found");
    return recipe;
  }

  create(dto: CreateRecipeDto, userId: string, organizationId: string) {
    return this.prisma.mediaRecipe.create({
      data: {
        organizationId,
        name: dto.name,
        basalMediaType: dto.basalMediaType,
        targetPh: dto.targetPh,
        gellingAgentId: dto.gellingAgentId,
        createdById: userId,
        components: {
          create: dto.components.map((c) => ({
            organizationId,
            chemicalId: c.chemicalId,
            concentration: c.concentration,
            unit: c.unit,
          })),
        },
      },
      include: { components: true },
    });
  }

  /** qty = concentration x target_volume / stock_concentration (docs/01-architecture-overview.md). */
  async calculate(id: string, dto: CalculateRecipeDto, organizationId: string) {
    const recipe = await this.findOne(id, organizationId);
    return recipe.components.map((component) => {
      const requiredQty =
        (Number(component.concentration) * dto.targetVolumeL) /
        Number(component.chemical.stockConcentration);
      return {
        chemicalId: component.chemicalId,
        chemicalName: component.chemical.name,
        unit: component.unit,
        requiredQty,
        currentStockQty: Number(component.chemical.currentStockQty),
        sufficient: Number(component.chemical.currentStockQty) >= requiredQty,
      };
    });
  }
}
