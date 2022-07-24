import { Injectable } from "@nestjs/common";
import { Message, Prisma } from "@prisma/client";
import { MessageUpdatePayload } from "types";
import { PrismaService } from "./prisma.service";

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getMessages(): Promise<Message[]> {
    return this.prisma.message.findMany();
  }

  async clearMessages(): Promise<Prisma.BatchPayload> {
    return this.prisma.message.deleteMany();
  }

  async createMessage(data: Prisma.MessageCreateInput) {
    return this.prisma.message.create({ data });
  }

  async updateMessage(payload: MessageUpdatePayload) {
    const { id, text } = payload;
    return this.prisma.message.update({ where: { id }, data: { text } });
  }

  async removeMessage(where: Prisma.MessageWhereUniqueInput) {
    return this.prisma.message.delete({ where });
  }
}
