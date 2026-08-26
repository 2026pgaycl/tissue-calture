import { Module } from "@nestjs/common";
import { ContaminationEventsController } from "./contamination-events.controller";
import { ContaminationEventsService } from "./contamination-events.service";
import { DiscardLogsController } from "./discard-logs.controller";
import { DiscardLogsService } from "./discard-logs.service";

@Module({
  controllers: [ContaminationEventsController, DiscardLogsController],
  providers: [ContaminationEventsService, DiscardLogsService],
})
export class QcModule {}
