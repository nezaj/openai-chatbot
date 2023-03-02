import assert from "assert";
import Head from "next/head";
import { ChatCompletionRequestMessage } from "openai";
import { useState } from "react";
import type { ChatResponse } from "./api/chat";

// (XXX): Hack for scrolling down on new messages
function checkOverflow(): void {
  const el = document.getElementById("chat");
  el ? (el.scrollTop = el.scrollHeight) : null;
}

const Home = () => {
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages]: [ChatCompletionRequestMessage[], Function] =
    useState([]);

  async function onSubmit(event: any) {
    event.preventDefault();
    setChatInput("");
    setIsLoading(true);
    const newMessage: ChatCompletionRequestMessage = {
      role: "user",
      content: chatInput,
    };
    setMessages((oldMessages: ChatCompletionRequestMessage[]) => [
      ...oldMessages,
      newMessage,
    ]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, newMessage] }),
      });

      const data: ChatResponse = await response.json();
      if (data.error) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setIsLoading(false);
      assert(data.newMessage);
      setMessages((oldMessages: ChatCompletionRequestMessage[]) => [
        ...oldMessages,
        data.newMessage,
      ]);
      checkOverflow();
    } catch (error: any) {
      setIsLoading(false);
      console.error(error);
    }
  }

  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className="flex flex-col items-center mx-4">
        <h1 className="text-xl my-2">Chat</h1>
        <div
          id="chat"
          className="px-8 w-full h-80 border-2 border-black overflow-y-scroll py-4"
        >
          {messages.map((m, i) => (
            <div key={i} className="py-2">
              {m.role}: {m.content}
            </div>
          ))}
          {isLoading && <div className="py-2">...</div>}
        </div>
        <form onSubmit={onSubmit} className="w-full">
          <input
            className="w-full border-2 border-black my-4 py-2 pl-2 hover:cursor-pointer hover:bg-slate-200"
            type="text"
            name="animal"
            placeholder="Enter a message"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <input
            className="border-2 border-black px-4 py-2 hover:bg-slate-200 hover:cursor-pointer"
            type="submit"
            value="Send"
            disabled={!chatInput.length}
          />
        </form>
      </main>
    </div>
  );
};

export default Home;
