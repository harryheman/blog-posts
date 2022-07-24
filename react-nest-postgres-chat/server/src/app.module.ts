import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { AppGateway } from "./app.gateway";
import { PrismaService } from "./prisma.service";

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, AppService, AppGateway]
})
export class AppModule {}
