import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { berichten as leerlingBerichten, docentBerichten, type ChatBericht } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { Send, Paperclip, ShieldCheck, Search, Users, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/app/berichten")({ component: Berichten });

function Berichten() {
  const { role } = useRole();
  const berichten = role === "docent" ? docentBerichten : leerlingBerichten;

  const [selectedId, setSelectedId] = useState(berichten[0]?.id ?? "");
  const [threads, setThreads] = useState<Record<string, ChatBericht[]>>(() =>
    Object.fromEntries(berichten.map((b) => [b.id, [...b.thread]]))
  );
  const [msg, setMsg] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [mobileDetail, setMobileDetail] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Reset when role changes
  useEffect(() => {
    setSelectedId(berichten[0]?.id ?? "");
    setThreads(Object.fromEntries(berichten.map((b) => [b.id, [...b.thread]])));
    setMobileDetail(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const filtered = searchQ.trim()
    ? berichten.filter(
        (b) =>
          b.van.toLowerCase().includes(searchQ.toLowerCase()) ||
          b.preview.toLowerCase().includes(searchQ.toLowerCase())
      )
    : berichten;

  const chat = berichten.find((b) => b.id === selectedId) ?? berichten[0];
  const thread = threads[chat?.id] ?? chat?.thread ?? [];
  const isGroep = chat?.type === "groep";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length]);

  const sendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || !chat) return;
    const now = new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
    const newMsg: ChatBericht = { van: "Ik", tijd: now, mij: true, tekst: msg.trim() };
    setThreads((prev) => ({ ...prev, [chat.id]: [...(prev[chat.id] ?? []), newMsg] }));
    setMsg("");
  };

  if (!chat) return null;

  return (
    <AppShell title="Berichten" subtitle="Veilige, versleutelde communicatie">
      <div className="grid gap-0 overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[320px_1fr]" style={{ height: "calc(100vh - 10rem)" }}>
        {/* Conversation list */}
        <aside className={`flex flex-col border-b border-border md:border-b-0 md:border-r md:flex ${mobileDetail ? "hidden" : "flex"}`}>
          <div className="border-b border-border p-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Zoek in berichten..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">Geen berichten gevonden</div>
            )}
            {filtered.map((b) => (
              <button
                key={b.id}
                onClick={() => { setSelectedId(b.id); setMobileDetail(true); }}
                className={`flex w-full items-start gap-3 border-b border-border p-3 text-left transition-colors hover:bg-muted/50 ${selectedId === b.id ? "bg-muted/70" : ""}`}
              >
                {b.type === "groep" ? (
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${b.kleur} text-white`}>
                    <Users className="h-4 w-4" />
                  </div>
                ) : (
                  <img src={b.avatar} alt={b.van} className="h-10 w-10 shrink-0 rounded-full bg-muted object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold">{b.van}</div>
                    <div className="shrink-0 text-[11px] text-muted-foreground">{b.tijd}</div>
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">{b.rol}</div>
                  <div className="truncate text-xs text-muted-foreground">{b.preview}</div>
                </div>
                {b.ongelezen && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Chat panel */}
        <section className={`min-w-0 flex-col md:flex ${mobileDetail ? "flex" : "hidden"}`}>
          <div className="flex items-center gap-3 border-b border-border p-4">
            <button onClick={() => setMobileDetail(false)} className="rounded-md p-1 hover:bg-muted md:hidden" aria-label="Terug">
              <ArrowLeft className="h-4 w-4" />
            </button>
            {isGroep ? (
              <div className={`grid h-10 w-10 place-items-center rounded-full ${chat.kleur} text-white`}>
                <Users className="h-4 w-4" />
              </div>
            ) : (
              <img src={chat.avatar} alt={chat.van} className="h-10 w-10 rounded-full bg-muted object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{chat.van}</div>
              <div className="truncate text-[11px] text-muted-foreground">{chat.rol}</div>
            </div>
            <span className="hidden items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success sm:inline-flex">
              <ShieldCheck className="h-3 w-3" /> Versleuteld
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
            {thread.map((m, i) => {
              const prev = thread[i - 1];
              const toonAvatar = !m.mij && (!prev || prev.van !== m.van || prev.mij !== m.mij);
              return (
                <div key={i} className={`flex items-end gap-2 ${m.mij ? "justify-end" : "justify-start"}`}>
                  {!m.mij && (
                    <div className="w-8 shrink-0">
                      {toonAvatar && (
                        <img
                          src={m.avatar ?? chat.avatar}
                          alt={m.van}
                          className="h-8 w-8 rounded-full bg-muted object-cover"
                        />
                      )}
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.mij ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}>
                    {!m.mij && isGroep && toonAvatar && (
                      <div className="mb-0.5 text-[11px] font-semibold text-primary">{m.van}</div>
                    )}
                    <div>{m.tekst}</div>
                    <div className={`mt-1 text-[10px] ${m.mij ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.tijd}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={sendMsg}
            className="flex items-center gap-2 border-t border-border bg-background p-3"
          >
            <label className="rounded-lg p-2 hover:bg-muted cursor-pointer" aria-label="Bijlage">
              <Paperclip className="h-4 w-4" />
              <input type="file" className="hidden" onChange={() => {}} />
            </label>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Type een bericht..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!msg.trim()}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Versturen
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
