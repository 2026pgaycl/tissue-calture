import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ReferenceDataModule } from "./reference-data/reference-data.module";
import { BatchesModule } from "./batches/batches.module";
import { MediaPrepModule } from "./media-prep/media-prep.module";
import { SubcultureModule } from "./subculture/subculture.module";
import { QcModule } from "./qc/qc.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ReferenceDataModule,
    BatchesModule,
    MediaPrepModule,
    SubcultureModule,
    QcModule,
  ],
  providers: [
    // Order matters: authentication resolves req.user before RolesGuard reads it.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
