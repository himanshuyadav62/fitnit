"use client";

import { useState } from "react";
import { Bot, LoaderCircle, Send, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Message = { id: string; role: "user" | "assistant"; content: string };

export function CoachChat({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || pending) return;
    const optimistic: Message = { id: crypto.randomUUID(), role: "user", content: message };
    setMessages((current) => [...current, optimistic]);
    setInput("");
    setPending(true);
    try {
      const response = await fetch("/api/coach", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message }) });
      if (!response.ok) throw new Error("Coach is unavailable");
      const data = (await response.json()) as { message: Message };
      setMessages((current) => [...current, data.message]);
    } catch {
      toast.error("The coach could not reply. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-[600px] flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-1 pb-8">
        {messages.length === 0 && (
          <div className="mx-auto max-w-lg py-16 text-center"><div className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary"><Bot /></div><h2 className="text-xl font-semibold">Ask about today’s training</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Try “How should I progress my goblet squat?” or “What are easy vegan protein meals?”</p></div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" && "justify-end")}>
            {message.role === "assistant" && <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary"><Bot className="size-4" /></div>}
            <div className={cn("max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6", message.role === "user" ? "bg-primary text-primary-foreground" : "border bg-card")}>{message.content}</div>
            {message.role === "user" && <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted"><UserRound className="size-4" /></div>}
          </div>
        ))}
        {pending && <div className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Coach is thinking…</div>}
      </div>
      <form onSubmit={submit} className="sticky bottom-0 flex items-end gap-2 border-t bg-background/90 pt-4 backdrop-blur">
        <Textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about training, recovery, or vegan nutrition…" rows={2} maxLength={600} />
        <Button size="icon" className="size-11 shrink-0" disabled={pending || !input.trim()} aria-label="Send message"><Send /></Button>
      </form>
      <p className="mt-3 text-center text-xs text-muted-foreground">Guidance is educational and does not replace medical care. AI live mode is currently off.</p>
    </div>
  );
}
