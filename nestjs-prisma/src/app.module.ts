import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { UserService } from './user.service';
import { PostService } from './post.service';
import AdminModule from './admin.module';

@Module({
  imports: [AdminModule],
  controllers: [AppController],
  providers: [PrismaService, UserService, PostService],
})
export class AppModule {}
