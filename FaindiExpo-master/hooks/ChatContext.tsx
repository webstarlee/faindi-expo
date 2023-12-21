import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { convertApiUrl } from "../config";
import { useAuth } from "./AuthContext";
import socket from "../utils/socket";
import { ChatProps, MessageProps, UserProps } from "./types";

interface ChatContextValue {
  chats: ChatProps[] | [];
  updateChatData: (_chat: ChatProps) => void;
  checkMessageRead: (_user: UserProps) => void;
  addMessageChat: (_to_use_id: string, _message: MessageProps) => void;
  removeRateMessage: (_to_use_id: string) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, userId, authToken } = useAuth();
  const [chats, setChats] = useState<ChatProps[] | []>([]);
  const [isFetching, setIsFetching] = useState(false);

  const resetChatData = () => {
    setChats([]);
    setIsFetching(false);
  }

  useEffect(() => {
    if (isAuthenticated && userId && socket) {
      socket.on("new_chat", function (chat) {
        updateChatData(chat);

        console.log(chat)
      });

      socket.emit("chat_join", {
        user_id: userId,
      });
    }
  }, [isAuthenticated, userId, socket, chats]);

  const fetchChats = async () => {
    try {
        const response = await axios.get(convertApiUrl("chat/get-list"), {
          headers: { "x-access-token": authToken },
        });

        setChats(response.data.chats);
        
      } catch (error: any) {
        console.log(error?.response);
      }
  }

  useEffect(() => {
    if (isAuthenticated && !isFetching && authToken) {
      setIsFetching(true);
      fetchChats();
    }
  }, [isAuthenticated, isFetching, authToken]);

  useEffect(() => {
    if (!isAuthenticated) {
      resetChatData();
    }
  }, [isAuthenticated]);

  const updateChatData = (_chat: ChatProps) => {
    const _chats = chats;
    let removed_chats = _chats.filter((chat) => chat.user._id.toString() !== _chat.user._id.toString());
    removed_chats.unshift(_chat);
    setChats(removed_chats);
  }

  const checkMessageRead = (_user: UserProps) => {
    const _chats = [...chats];
    _chats.map((_chat) => {
      if (_chat.user._id.toString() === _user._id.toString()) {
        _chat.unread_count = 0;
      }
    })
  }

  const addMessageChat = (_to_use_id: string, _message: MessageProps) => {
    const _chats = [...chats];
    let update_chat = _chats.filter((chat) => chat.user._id.toString() === _to_use_id.toString())[0];
    if (update_chat) {
      //@ts-ignore
      update_chat.messages.push(_message)
    }
  }

  const removeRateMessage = (_to_use_id: string) => {
    let _chats = [...chats];
    _chats.map((_chat) => {
      if (_chat.user._id.toString() === _to_use_id.toString()) {
        const except_rate_message = _chat.messages.filter((message) => !message.is_rate);
        //@ts-ignore
        _chat.messages = except_rate_message
      }
    });

    setChats(_chats);
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        updateChatData,
        checkMessageRead,
        addMessageChat,
        removeRateMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
