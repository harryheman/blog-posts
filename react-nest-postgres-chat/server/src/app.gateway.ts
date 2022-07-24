import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Prisma } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { MessageUpdatePayload } from "types";
import { CLIENT_URI } from "../constants";
import { AppService } from "./app.service";

const users: Record<string, string> = {};

@WebSocketGateway({
  cors: {
    origin: CLIENT_URI
  },
  serveClient: false,
  namespace: "chat"
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly appService: AppService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage("messages:get")
  async handleMessagesGet(): Promise<void> {
    const messages = await this.appService.getMessages();
    this.server.emit("messages", messages);
  }

  @SubscribeMessage("messages:clear")
  async handleMessagesClear(): Promise<void> {
    await this.appService.clearMessages();
  }

  @SubscribeMessage("message:post")
  async handleMessagePost(
    @MessageBody()
    payload: // { userId: string, userName: string, text: string }
    Prisma.MessageCreateInput
  ): Promise<void> {
    const createdMessage = await this.appService.createMessage(payload);
    this.server.emit("message:post", createdMessage);
    this.handleMessagesGet();
  }

  @SubscribeMessage("message:put")
  async handleMessagePut(
    @MessageBody()
    payload: // { id: number, text: string }
    MessageUpdatePayload
  ): Promise<void> {
    const updatedMessage = await this.appService.updateMessage(payload);
    this.server.emit("message:put", updatedMessage);
    this.handleMessagesGet();
  }

  @SubscribeMessage("message:delete")
  async handleMessageDelete(
    @MessageBody()
    payload: // { id: number }
    Prisma.MessageWhereUniqueInput
  ) {
    const removedMessage = await this.appService.removeMessage(payload);
    this.server.emit("message:delete", removedMessage);
    this.handleMessagesGet();
  }

  afterInit(server: Server) {
    console.log(server);
  }

  handleConnection(client: Socket, ...args: any[]) {
    const userName = client.handshake.query.userName as string;
    const socketId = client.id;
    users[socketId] = userName;

    client.broadcast.emit("log", `${userName} connected`);
  }

  handleDisconnect(client: Socket) {
    const socketId = client.id;
    const userName = users[socketId];
    delete users[socketId];

    client.broadcast.emit("log", `${userName} disconnected`);
  }
}
