import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CompleteSessionDto, StartSessionDto } from "./subculture.dto";
import { generateBarcode } from "../common/utils/barcode.util";
import type { AuthenticatedUser } from "../auth/jwt-payload.interface";

@Injectable()
export class SubcultureSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async start(dto: StartSessionDto, user: AuthenticatedUser) {
    const inputVessels = await this.prisma.vessel.findMany({
      where: { id: { in: dto.inputVesselIds } },
    });
    if (inputVessels.length !== dto.inputVesselIds.length) {
      throw new BadRequestException("One or more input vessels were not found");
    }

    return this.prisma.subcultureSession.create({
      data: {
        workstationId: dto.workstationId,
        operatorId: user.id,
        sessionVessels: {
          create: dto.inputVesselIds.map((vesselId) => ({
            vesselId,
            direction: "INPUT" as const,
          })),
        },
      },
      include: { sessionVessels: true },
    });
  }

  /**
   * Closes a session by creating N output vessels, each a lineage child of the session's
   * primary input vessel and belonging to the same batch (stage advancement to a new batch
   * is a separate `POST /batches` call, not implied by completing a session).
   */
  async complete(id: string, dto: CompleteSessionDto) {
    const session = await this.prisma.subcultureSession.findUnique({
      where: { id },
      include: { sessionVessels: { where: { direction: "INPUT" }, include: { vessel: true } } },
    });
    if (!session) throw new NotFoundException("Subculture session not found");
    if (session.endedAt) throw new BadRequestException("Session already completed");

    const primaryInput = session.sessionVessels[0]?.vessel;
    if (!primaryInput) throw new BadRequestException("Session has no input vessels");

    return this.prisma.$transaction(async (tx) => {
      const outputVessels = [];
      for (const output of dto.outputs) {
        const vessel = await tx.vessel.create({
          data: {
            barcode: generateBarcode("VSL"),
            batchId: primaryInput.batchId,
            parentVesselId: primaryInput.id,
            locationId: output.locationId,
            vesselType: output.vesselType ?? primaryInput.vesselType,
            mediaBatchId: dto.mediaBatchId,
          },
        });
        await tx.subcultureSessionVessel.create({
          data: { sessionId: id, vesselId: vessel.id, direction: "OUTPUT" },
        });
        outputVessels.push(vessel);
      }

      const updatedSession = await tx.subcultureSession.update({
        where: { id },
        data: { endedAt: new Date(), splitRatio: dto.splitRatio, notes: dto.notes },
      });

      return { session: updatedSession, outputVessels };
    });
  }
}
