import { Module } from "@nestjs/common";
import { ChemicalsController } from "./chemicals.controller";
import { ChemicalsService } from "./chemicals.service";
import { RecipesController } from "./recipes.controller";
import { RecipesService } from "./recipes.service";
import { MediaBatchesController } from "./media-batches.controller";
import { MediaBatchesService } from "./media-batches.service";

@Module({
  controllers: [ChemicalsController, RecipesController, MediaBatchesController],
  providers: [ChemicalsService, RecipesService, MediaBatchesService],
})
export class MediaPrepModule {}
