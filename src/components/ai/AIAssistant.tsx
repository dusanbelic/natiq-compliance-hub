import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User, Sparkles, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SAMPLE_QUESTIONS = [
  "What is Nitaqat?",
  "How is compliance ratio calculated?",
  "What are the penalties for non-compliance?",
  "How do I improve my Emiratisation ratio?",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compliance-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Array<{ role: string; content: string }>;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ error: "Request failed" }));
    onError(body.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) {
    onError("No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Flush remaining
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your NatIQ compliance assistant. I can answer questions about Nitaqat, Emiratisation, Qatarisation, and Omanisation. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const assistantContentRef = useRef('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && !minimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, minimized]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    assistantContentRef.current = '';

    // Build conversation history for context
    const history = messages
      .filter((m) => m.id !== '1') // skip initial greeting from history
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: text.trim() });

    const upsertAssistant = (chunk: string) => {
      assistantContentRef.current += chunk;
      const currentContent = assistantContentRef.current;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id.startsWith('stream-')) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: currentContent } : m
          );
        }
        return [
          ...prev,
          {
            id: `stream-${Date.now()}`,
            role: 'assistant' as const,
            content: currentContent,
            timestamp: new Date(),
          },
        ];
      });
    };

    try {
      await streamChat({
        messages: history,
        onDelta: upsertAssistant,
        onDone: () => setIsStreaming(false),
        onError: (error) => {
          setIsStreaming(false);
          toast.error(error);
          // Add error message
          setMessages((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              role: 'assistant',
              content: `Sorry, I encountered an error: ${error}. Please try again.`,
              timestamp: new Date(),
            },
          ]);
        },
      });
    } catch (e) {
      console.error('Stream error:', e);
      setIsStreaming(false);
      toast.error('Failed to connect to AI assistant');
    }
  }, [isStreaming, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 w-14 h-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  if (minimized) {
    return (
      <div
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-lg cursor-pointer z-50 flex items-center gap-2"
        onClick={() => setMinimized(false)}
      >
        <Bot className="w-5 h-5" />
        <span className="text-sm font-medium">NatIQ Assistant</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-0 left-0 sm:left-auto sm:bottom-20 lg:bottom-6 lg:right-6 sm:right-4 sm:w-96 h-[70vh] sm:h-[500px] bg-card border rounded-t-xl sm:rounded-xl shadow-elevated z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">NatIQ Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary/80" onClick={() => setMinimized(true)}>
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary/80" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-2',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'rounded-lg px-3 py-2 max-w-[80%] text-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isStreaming && !messages[messages.length - 1]?.id.startsWith('stream-') && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Questions */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-1">
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about compliance..."
          className="flex-1"
          disabled={isStreaming}
        />
        <Button type="submit" size="icon" disabled={!input.trim() || isStreaming}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
