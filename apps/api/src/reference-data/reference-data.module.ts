import { Module } from "@nestjs/common";
import { PlantSpeciesController } from "./plant-species.controller";
import { PlantSpeciesService } from "./plant-species.service";
import { LocationsController } from "./locations.controller";
import { LocationsService } from "./locations.service";

@Module({
  controllers: [PlantSpeciesController, LocationsController],
  providers: [PlantSpeciesService, LocationsService],
})
export class ReferenceDataModule {}
