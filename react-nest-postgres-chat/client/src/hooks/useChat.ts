import { Message, Prisma } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SERVER_URI, USER_INFO } from "../constants";
import { MessageUpdatePayload, UserInfo } from "../types";
import { storage } from "../utils";

let socket: Socket;

export const useChat = () => {
  const userInfo = storage.get<UserInfo>(USER_INFO) as UserInfo;

  if (!socket) {
    socket = io(SERVER_URI, {
      query: {
        userName: userInfo.userName
      }
    });
  }

  const [messages, setMessages] = useState<Message[]>();
  const [log, setLog] = useState<string>();

  useEffect(() => {
    socket.on("log", (log: string) => {
      setLog(log);
    });

    socket.on("messages", (messages: Message[]) => {
      setMessages(messages);
    });

    socket.emit("messages:get");
  }, []);

  const send = useCallback((payload: Prisma.MessageCreateInput) => {
    socket.emit("message:post", payload);
  }, []);

  const update = useCallback((payload: MessageUpdatePayload) => {
    socket.emit("message:put", payload);
  }, []);

  const remove = useCallback((payload: Prisma.MessageWhereUniqueInput) => {
    socket.emit("message:delete", payload);
  }, []);

  window.clearMessages = useCallback(() => {
    socket.emit("messages:clear");
    location.reload();
  }, []);

  const chatActions = useMemo(
    () => ({
      send,
      update,
      remove
    }),
    []
  );

  return { messages, log, chatActions };
};
