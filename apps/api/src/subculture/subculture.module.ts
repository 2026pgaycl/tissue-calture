import { Module } from "@nestjs/common";
import { WorkstationsController } from "./workstations.controller";
import { WorkstationsService } from "./workstations.service";
import { SubcultureSessionsController } from "./subculture-sessions.controller";
import { SubcultureSessionsService } from "./subculture-sessions.service";

@Module({
  controllers: [WorkstationsController, SubcultureSessionsController],
  providers: [WorkstationsService, SubcultureSessionsService],
})
export class SubcultureModule {}
