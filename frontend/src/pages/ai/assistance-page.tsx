import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Form,
  Grid,
  GridContainer,
  Label,
  Tag,
  TextInput,
} from "@trussworks/react-uswds";
import { useState } from "react";
import { useChat } from "@tanstack/ai-react";

import { chatConnection } from "@/shared/api/ai-api";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMarkdown(value: string): string {
  const escaped = escapeHtml(value);

  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/`([^`]+?)`/g, "<code>$1</code>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
    )
    .replace(/\n/g, "<br />");
}

export function AssistancePage() {
  const connection = chatConnection();
  const { messages, sendMessage, isLoading, error } = useChat({ connection });
  const [input, setInput] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setInput("");
  };

  return (
    <div className="usa-section">
      <GridContainer>
        <Grid row gap>
          <main
            className="usa-layout-docs__main grid-col-12 desktop:grid-col-9 usa-prose usa-layout-docs list-style-none"
            style={{ listStyleType: "none" }}
            id="main-content"
          >
            <h2>Got questions?</h2>

            <Card>
              <CardHeader>
                <h3 className="margin-0">AI Assistance</h3>
              </CardHeader>
              <CardBody>
                <div className="display-flex flex-column gap-2 padding-bottom-3" aria-live="polite">
                  {messages.length === 0 && (
                    <p className="text-darkest">Ask anything about the paid leave benefits.</p>
                  )}
                  {messages.map((message) => {
                    const isUser = message.role !== "assistant";
                    return (
                      <div
                        key={message.id}
                        className={`display-flex ${isUser ? "flex-justify-end" : "flex-justify-start"} margin-bottom-2`}
                      >
                        <div
                          className="padding-2 border-1px border-base-lighter radius-md bg-base-lightest text-darkest"
                          style={{ maxWidth: isUser ? "75%" : "100%" }}
                        >
                          <div className="display-flex flex-align-center gap-1 margin-bottom-1">
                            <Tag className="text-uppercase" background={message.role === "assistant" ? "blue" : "green"}>
                              {message.role === "assistant" ? "Assistant" : "You"}
                            </Tag>
                          </div>
                          <div className="text-darkest">
                            {message.parts.map((part, index) => {
                              if (part.type === "thinking") {
                                return (
                                  <p key={`${message.id}-think-${index}`} className="text-italic text-gray-60">
                                    {part.content}
                                  </p>
                                );
                              }
                              if (part.type === "text") {
                                return (
                                  <div
                                    key={`${message.id}-text-${index}`}
                                    className="usa-prose"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(part.content) }}
                                  />
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {error && (
                    <div className="text-red">
                      <strong>Error:</strong> {error.message}
                    </div>
                  )}
                </div>
              </CardBody>
              <CardFooter>
                <Form onSubmit={handleSubmit} className="width-full" style={{ maxWidth: '100%' }}>
                  <Label htmlFor="ai-question" className="usa-sr-only">Ask a question</Label>
                  <Grid row gap className="flex-align-end">
                    <Grid col={12} tablet={{ col: true }}>
                      <TextInput
                        id="ai-question"
                        name="ai-question"
                        type="text"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        disabled={isLoading}
                        placeholder="Ask me about paid leave ..."
                        className="margin-top-0"
                      />
                    </Grid>
                    <Grid col={12} tablet={{ col: 'auto' }}>
                      <Button type="submit" disabled={!input.trim() || isLoading} className="width-full tablet:width-auto">
                        {isLoading ? "Thinking..." : "Send"}
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              </CardFooter>
            </Card>
          </main>
        </Grid>
      </GridContainer>
    </div>
  );
}
