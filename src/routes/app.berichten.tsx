import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { berichten } from "@/lib/demo-data";
import { Send, Paperclip, ShieldCheck, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/berichten")({ component: Berichten });

const thread = [
  { van: "M. Jansen", tijd: "10:22", mij: false, tekst: "Hoi Sanne, ik zag dat je opdracht voor H4 nog niet is ingeleverd." },
  { van: "M. Jansen", tijd: "10:23", mij: false, tekst: "Deadline is morgen 23:59 — lukt dat?" },
  { van: "Ik", tijd: "10:31", mij: true, tekst: "Ja, ik ben er vanavond mee bezig. Vraag 6 snap ik niet helemaal, mag ik morgen even langskomen?" },
  { van: "M. Jansen", tijd: "10:32", mij: false, tekst: "Prima, kom rond 12:00 langs bij lokaal 204. Dan kijken we samen." },
  { van: "Ik", tijd: "10:33", mij: true, tekst: "Top, tot morgen!" },
];

function Berichten() {
  const [selected, setSelected] = useState(0);
  const [msg, setMsg] = useState("");
  return (
    <AppShell title="Berichten" subtitle="Veilige, versleutelde communicatie">
      <div className="grid gap-0 overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[320px_1fr]" style={{ height: "calc(100vh - 10rem)" }}>
        <aside className="flex flex-col border-b border-border md:border-b-0 md:border-r">
          <div className="border-b border-border p-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Zoek in berichten..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {berichten.map((b, i) => (
              <button
                key={b.van}
                onClick={() => setSelected(i)}
                className={`flex w-full items-start gap-3 border-b border-border p-3 text-left transition-colors hover:bg-muted/50 ${selected === i ? "bg-muted/70" : ""}`}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{b.avatar}</div>
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

        <section className="flex min-w-0 flex-col">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{berichten[selected].avatar}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{berichten[selected].van}</div>
              <div className="truncate text-[11px] text-muted-foreground">{berichten[selected].rol}</div>
            </div>
            <span className="hidden items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success sm:inline-flex">
              <ShieldCheck className="h-3 w-3" /> Versleuteld
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
            {thread.map((m, i) => (
              <div key={i} className={`flex ${m.mij ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.mij ? "bg-primary text-primary-foreground" : "bg-background border border-border"}`}>
                  <div>{m.tekst}</div>
                  <div className={`mt-1 text-[10px] ${m.mij ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.tijd}</div>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setMsg(""); }}
            className="flex items-center gap-2 border-t border-border bg-background p-3"
          >
            <button type="button" className="rounded-lg p-2 hover:bg-muted" aria-label="Bijlage"><Paperclip className="h-4 w-4" /></button>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Type een bericht..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <Send className="h-4 w-4" /> Versturen
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
