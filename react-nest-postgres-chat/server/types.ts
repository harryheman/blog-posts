import { Prisma } from "@prisma/client";

export type MessageUpdatePayload = Prisma.MessageWhereUniqueInput &
  Pick<Prisma.MessageUpdateInput, "text">;
