import { Module } from "@nestjs/common";
import { BatchesController } from "./batches.controller";
import { BatchesService } from "./batches.service";
import { VesselsController } from "./vessels.controller";
import { VesselsService } from "./vessels.service";

@Module({
  controllers: [BatchesController, VesselsController],
  providers: [BatchesService, VesselsService],
})
export class BatchesModule {}
