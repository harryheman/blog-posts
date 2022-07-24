import { Prisma } from "@prisma/client";

export type UserInfo = {
  userId: string;
  userName: string;
};

export type MessageUpdatePayload = Prisma.MessageWhereUniqueInput &
  Pick<Prisma.MessageUpdateInput, "text">;
