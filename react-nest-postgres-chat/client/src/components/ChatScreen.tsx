import React, { useEffect, useState } from "react";
import { FiEdit2, FiSend, FiTrash } from "react-icons/fi";
import { MdOutlineClose } from "react-icons/md";
import TimeAgo from "react-timeago";
import { Slide, toast, ToastContainer } from "react-toastify";
import { USER_INFO } from "../constants";
import { useChat } from "../hooks/useChat";
import { UserInfo } from "../types";
import { storage } from "../utils";

const notify = (message: string) =>
  toast.info(message, {
    position: "top-left",
    autoClose: 1000,
    hideProgressBar: true,
    transition: Slide
  });

export const ChatScreen = () => {
  const userInfo = storage.get<UserInfo>(USER_INFO) as UserInfo;
  const { userId, userName } = userInfo;

  const { messages, log, chatActions } = useChat();

  const [text, setText] = useState("");
  const [editingState, setEditingState] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(0);

  const changeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) return;

    const message = {
      userId,
      userName,
      text
    };

    if (editingState) {
      chatActions.update({ id: editingMessageId, text });
      setEditingState(false);
    } else {
      chatActions.send(message);
    }

    setText("");
  };

  const removeMessage = (id: number) => {
    chatActions.remove({ id });
  };

  useEffect(() => {
    if (!log) return;

    notify(log);
  }, [log]);

  return (
    <>
      <h1 className="title">Let's Chat</h1>
      <div className="flex-1 flex flex-col">
        {messages &&
          messages.length > 0 &&
          messages.map((message) => {
            const isMsgBelongsToUser = message.userId === userInfo.userId;

            return (
              <div
                key={message.id}
                className={[
                  "my-2 p-2 rounded-md text-white w-1/2",
                  isMsgBelongsToUser
                    ? "self-end bg-green-500"
                    : "self-start bg-blue-500",
                  editingState ? "bg-gray-300" : ""
                ].join(" ")}
              >
                <div className="flex justify-between text-sm mb-1">
                  <p>
                    By <span>{message.userName}</span>
                  </p>
                  <TimeAgo date={message.createdAt} />
                </div>
                <p>{message.text}</p>
                {isMsgBelongsToUser && (
                  <div className="flex justify-end gap-2">
                    <button
                      disabled={editingState}
                      className={`${
                        editingState ? "hidden" : "text-orange-500"
                      }`}
                      onClick={() => {
                        setEditingState(true);
                        setEditingMessageId(message.id);
                        setText(message.text);
                      }}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      disabled={editingState}
                      className={`${editingState ? "hidden" : "text-red-500"}`}
                      onClick={() => {
                        removeMessage(message.id);
                      }}
                    >
                      <FiTrash />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
      <form onSubmit={sendMessage} className="flex items-stretch">
        <div className="flex-1 flex">
          <input
            type="text"
            id="message"
            name="message"
            value={text}
            onChange={changeText}
            autoFocus
            required
            autoComplete="off"
            className="input flex-1"
          />
        </div>
        {editingState && (
          <button
            className="btn-error"
            type="button"
            onClick={() => {
              setEditingState(false);
              setText("");
            }}
          >
            <MdOutlineClose fontSize={18} />
          </button>
        )}
        <button className="btn-primary">
          <FiSend fontSize={18} />
        </button>
      </form>
      <ToastContainer />
    </>
  );
};
