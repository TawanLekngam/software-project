"use client"

import { useState, useRef } from "react"
import Draggable from "react-draggable"
import { Resizable } from "re-resizable"

import { X, Send, Bot } from "lucide-react"

import { AIChatBox } from "@/components/chat-ai"
import { UserChatBox } from "@/components/chat-user"
import axios from "axios"
import { set } from "zod"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

import Image from "next/image"
import ChatPic from "@/public/chat-pic.svg"

interface ChatProps {
  text: string
  type: string
}

export const Chat = () => {
  const [chat, setChat] = useState(false)
  const [messages, setMessages] = useState<ChatProps[]>([])
  const [message, setMessage] = useState<ChatProps>({ text: "", type: "" })
  let allMessages: ChatProps[] = messages
  const [loading, setLoading] = useState(false)

  const chatRef = useRef<null | HTMLDivElement>(null)

  const getMessages = async () => {
    return await axios.post("/api/chat-ai", { message: message.text })
  }

  const submit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      chatRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    }, 100)
    if (message?.text === "") return
    allMessages.push(message)
    setMessages(allMessages)
    setMessage({ text: "", type: "ai" })
    let response = await getMessages()
    setLoading(false)
    setMessages((prevItem) => [
      ...prevItem,
      { text: response.data, type: "ai" },
    ])
    setTimeout(() => {
      chatRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    }, 100)
  }

  return (
    <>
      <div className="fixed z-20 bottom-[50px] right-[50px]">
        <Bot
          className="w-14 h-14 bg-[#4F46E5] drop-shadow-xl text-white p-3 rounded-full"
          onClick={() => setChat(!chat)}
        />
      </div>
      <Draggable>
        <div
          className={`items-center justify-center bg-[#F3F4F4] shadow-md z-20 rounded-md ${
            chat
              ? "fixed bottom-[130px] right-[20px] sm:right-[50px]"
              : "hidden"
          }`}
        >
          <Resizable
            className="flex flex-col"
            defaultSize={{
              width: 450,
              height: 450,
            }}
            minHeight={450}
            minWidth={450}
          >
            <div className="bg-white w-full rounded-t-md flex flex-row items-center py-4 px-10 self-start">
              <h3 className="grow text-xl font-semibold">AI Chat</h3>
              <X onClick={() => setChat(!chat)} />
            </div>
            <ScrollArea className="grow">
              <div className="px-10 pt-10">
                <div className="gap-5 flex flex-col" ref={chatRef}>
                  <AIChatBox AIText="Welcome to the Ai Teach! What can I help you with?" />
                  {messages.map((message, index) => {
                    if (message.type === "ai") {
                      return <AIChatBox key={index} AIText={message.text} />
                    }
                    return <UserChatBox key={index} UserText={message.text} />
                  })}
                  {loading && (
                    <div className="min-w-[330px] p-5 mr-14 gap-5 flex bg-[#4F46E5] rounded-md items-start self-start">
                      <Image
                        className="w-[32px] float-right"
                        src={ChatPic}
                        alt={"ChatPic"}
                      />
                      <Skeleton className="w-[200px] h-[20px] rounded-full self-center" />
                    </div>
                  )}
                </div>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
            <div className="relative mx-10 mb-10 mt-5">
              <input
                type="text"
                placeholder="Type your question here"
                className="w-full pr-20 py-5 px-7 text-base bg-white border-gray-300 focus:outline-none border-2 focus:border-[#4F46E5] rounded-md "
                value={message?.text}
                onChange={(e) =>
                  setMessage({ text: e.target.value, type: "user" })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    submit(e)
                  }
                }}
              />
              <Send
                className="w-7 h-7 absolute bottom-5 right-7 text-[#4F46E5]"
                onClick={submit}
              />
            </div>
          </Resizable>
        </div>
      </Draggable>
    </>
  )
}
