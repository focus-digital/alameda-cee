// components/Chat.tsx
import { useState } from "react";
import { useChat, type ConnectionAdapter } from "@tanstack/ai-react";
import { Button, Form, TextInput } from "@trussworks/react-uswds";

type ChatProps = {
  connection: ConnectionAdapter
}

export function Chat({ connection }: ChatProps) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, isLoading } = useChat({ connection });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="display-flex flex-column height-full">
      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto padding-2"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`margin-bottom-2 ${
              message.role === "assistant" ? "text-primary" : "text-base-darker"
            }`}
          >
            <div className="text-bold margin-bottom-05">
              {message.role === "assistant" ? "Assistant" : "You"}
            </div>
            <div>
              {message.parts.map((part, idx) => {
                if (part.type === "thinking") {
                  return (
                    <div
                      key={idx}
                      className="font-body-2xs text-base-dark text-italic margin-bottom-1"
                    >
                      Thinking: {part.content}
                    </div>
                  );
                }
                if (part.type === "text") {
                  return <div key={idx}>{part.content}</div>;
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <Form onSubmit={handleSubmit} className="padding-2 border-top-1px border-base-lighter">
        <div className="display-flex flex-gap-1">
          <TextInput
            id="chat-input"
            name="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
            style={{ flex: 1, minWidth: 0 }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
          >
            Send
          </Button>
        </div>
      </Form>
    </div>
  );
}
