import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  berichten as leerlingBerichten,
  docentBerichten,
  ouderBerichten,
  teamleiderBerichten,
  directieBerichten,
  type ChatBericht,
} from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import {
  Send,
  Paperclip,
  ShieldCheck,
  Search,
  Users,
  ArrowLeft,
  Megaphone,
  X,
  MessageSquarePlus,
  UserPlus,
  CalendarClock,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/berichten")({ component: Berichten });

const autoAntwoorden: Record<string, string> = {
  // leerling
  jansen: "Goed, ik zal er naar kijken. Stuur het maar door!",
  v4b: "👍",
  deboer: "Bedankt! Tot de volgende keer.",
  // docent
  "deboer-col": "Prima, ik stuur de lesstof vanavond door.",
  "sectie-wi": "Duidelijk, tot de vergadering!",
  teamleider: "Ik zet het op de agenda voor volgende week.",
  "over-tom": "Goed idee. Ik reserveer de vergaderzaal.",
  surveillance: "Ontvangen, bedankt voor de bevestiging.",
  // ouder
  "mentor-ouder": "Dank u wel, ik zal dit bespreken met Sanne.",
  "school-aankondiging-ouder": "",
  "teamleider-ouder": "Bedankt voor de bevestiging, wij zijn er bij.",
  // teamleider
  "directie-tl": "Komt voor elkaar, tot donderdag.",
  "jansen-tl": "Ik plan het overleg voor donderdag na schooltijd.",
  "sectie-bovenbouw": "Bedankt voor de terugkoppeling!",
  "rooster-tl": "Ontvangen en goedgekeurd.",
  // directie
  "bakker-dir": "Bedankt, ik neem het mee naar de vergadering.",
  "admin-rooster-dir": "Goedgekeurd, dank voor de melding.",
  "directie-overleg": "Dank, ik heb het doorgenomen.",
  "teamleider-onderbouw": "Ik neem contact op met de zorgcoördinator.",
};

function Berichten() {
  const { role } = useRole();
  const baseBerichten =
    role === "docent"
      ? docentBerichten
      : role === "ouder"
        ? ouderBerichten
        : role === "teamleider"
          ? teamleiderBerichten
          : role === "directie"
            ? directieBerichten
            : leerlingBerichten;

  const [nieuwChatOpen, setNieuwChatOpen] = useState(false);
  const [ncSearch, setNcSearch] = useState("");
  const [ncGroep, setNcGroep] = useState(false);
  const [ncGroepNaam, setNcGroepNaam] = useState("");
  const [ncSelected, setNcSelected] = useState<string[]>([]);
  const [extraChats, setExtraChats] = useState<typeof baseBerichten>([]);
  const allBerichten = [...baseBerichten, ...extraChats];
  const [selectedId, setSelectedId] = useState(allBerichten[0]?.id ?? "");
  const [threads, setThreads] = useState<Record<string, ChatBericht[]>>(() =>
    Object.fromEntries(allBerichten.map((b) => [b.id, [...b.thread]])),
  );
  const [msg, setMsg] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [mobileDetail, setMobileDetail] = useState(false);
  const [bijlageNaam, setBijlageNaam] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [planDatum, setPlanDatum] = useState("");
  const [geplandOpen, setGeplandOpen] = useState(false);
  const [geplandeBerichten, setGeplandeBerichten] = useState<
    { tekst: string; datum: string; chatId: string }[]
  >([]);
  const [schoolBreedOpen, setSchoolBreedOpen] = useState(false);
  const [sbDoelgroepen, setSbDoelgroepen] = useState({
    leerlingen: false,
    ouders: false,
    docenten: false,
    teamleiders: false,
  });
  const [sbOnderwerp, setSbOnderwerp] = useState("");
  const [sbBericht, setSbBericht] = useState("");
  const contacten =
    role === "leerling"
      ? [
          { id: "nc-mila", naam: "Mila Bakker", rol: "Klasgenoot · V4B" },
          { id: "nc-thomas", naam: "Thomas Smit", rol: "Klasgenoot · V4B" },
          { id: "nc-amber", naam: "Amber Jansen", rol: "Klasgenoot · V4B" },
          { id: "nc-jansen", naam: "M. Jansen", rol: "Docent Wiskunde" },
          { id: "nc-deboer", naam: "L. de Boer", rol: "Mentor Nederlands" },
        ]
      : role === "ouder"
        ? [
            { id: "nc-deboer", naam: "L. de Boer", rol: "Mentor V4B" },
            { id: "nc-bakker", naam: "I. Bakker", rol: "Teamleider Bovenbouw" },
            { id: "nc-jansen", naam: "M. Jansen", rol: "Docent Wiskunde" },
            { id: "nc-visser", naam: "K. Visser", rol: "Docent Scheikunde" },
            { id: "nc-green", naam: "S. Green", rol: "Docent Engels" },
          ]
        : role === "docent"
          ? [
              { id: "nc-visser", naam: "K. Visser", rol: "Collega · Scheikunde" },
              { id: "nc-green", naam: "S. Green", rol: "Collega · Engels" },
              { id: "nc-mulder", naam: "H. Mulder", rol: "Collega · Biologie" },
              { id: "nc-bakker", naam: "I. Bakker", rol: "Teamleider Bovenbouw" },
            ]
          : [
              { id: "nc-jansen", naam: "M. Jansen", rol: "Docent Wiskunde" },
              { id: "nc-deboer", naam: "L. de Boer", rol: "Docent / Mentor" },
              { id: "nc-visser", naam: "K. Visser", rol: "Docent Scheikunde" },
              { id: "nc-green", naam: "S. Green", rol: "Docent Engels" },
              { id: "nc-mulder", naam: "H. Mulder", rol: "Docent Biologie" },
              { id: "nc-bakker", naam: "I. Bakker", rol: "Teamleider Bovenbouw" },
            ];
  const bottomRef = useRef<HTMLDivElement>(null);

  // Reset when role changes
  useEffect(() => {
    setExtraChats([]);
    setSelectedId(baseBerichten[0]?.id ?? "");
    setThreads(Object.fromEntries(baseBerichten.map((b) => [b.id, [...b.thread]])));
    setGeplandeBerichten([]);
    setPlanOpen(false);
    setPlanDatum("");
    setNieuwChatOpen(false);
    setNcSearch("");
    setNcGroep(false);
    setNcGroepNaam("");
    setNcSelected([]);
    setMobileDetail(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const filtered = searchQ.trim()
    ? allBerichten.filter(
        (b) =>
          b.van.toLowerCase().includes(searchQ.toLowerCase()) ||
          b.preview.toLowerCase().includes(searchQ.toLowerCase()),
      )
    : allBerichten;

  const chat = allBerichten.find((b) => b.id === selectedId) ?? allBerichten[0];
  const thread = threads[chat?.id] ?? chat?.thread ?? [];
  const isGroep = chat?.type === "groep";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, typing]);

  const sendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!msg.trim() && !bijlageNaam) || !chat) return;
    const now = new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
    const tekst = bijlageNaam
      ? `📎 ${bijlageNaam}${msg.trim() ? `\n${msg.trim()}` : ""}`
      : msg.trim();
    const newMsg: ChatBericht = { van: "Ik", tijd: now, mij: true, tekst };
    setThreads((prev) => ({ ...prev, [chat.id]: [...(prev[chat.id] ?? []), newMsg] }));
    setMsg("");
    setBijlageNaam(null);

    // Typing indicator + auto reply
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = autoAntwoorden[chat.id] ?? "Ik kom er zo op terug.";
      const replyMsg: ChatBericht = {
        van: chat.van,
        tijd: new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
        mij: false,
        tekst: reply,
        avatar: chat.avatar,
      };
      setThreads((prev) => ({ ...prev, [chat.id]: [...(prev[chat.id] ?? []), replyMsg] }));
    }, 2000);
  };

  if (!chat) return null;

  return (
    <AppShell title="Berichten" subtitle="Veilige, versleutelde communicatie">
      <div
        className="grid gap-0 overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[320px_1fr]"
        style={{ height: "calc(100vh - 10rem)" }}
      >
        {/* Conversation list */}
        <aside
          className={`flex flex-col border-b border-border md:border-b-0 md:border-r md:flex ${mobileDetail ? "hidden" : "flex"}`}
        >
          <div className="border-b border-border p-3">
            <button
              onClick={() => setNieuwChatOpen(true)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" /> Nieuwe chat
            </button>
          </div>
          {role === "directie" && (
            <div className="border-b border-border p-3">
              <button
                onClick={() => setSchoolBreedOpen(true)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
              >
                <Megaphone className="h-3.5 w-3.5" /> Schoolbrede mededeling
              </button>
            </div>
          )}
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
              <div className="p-6 text-center text-xs text-muted-foreground">
                Geen berichten gevonden
              </div>
            )}
            {filtered.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedId(b.id);
                  setMobileDetail(true);
                }}
                className={`flex w-full items-start gap-3 border-b border-border p-3 text-left transition-colors hover:bg-muted/50 ${selectedId === b.id ? "bg-muted/70" : ""}`}
              >
                {b.type === "groep" ? (
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${b.kleur} text-white`}
                  >
                    <Users className="h-4 w-4" />
                  </div>
                ) : (
                  <img
                    src={b.avatar}
                    alt={b.van}
                    className="h-10 w-10 shrink-0 rounded-full bg-muted object-cover"
                  />
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
            <button
              onClick={() => setMobileDetail(false)}
              className="rounded-md p-1 hover:bg-muted md:hidden"
              aria-label="Terug"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            {isGroep ? (
              <div
                className={`grid h-10 w-10 place-items-center rounded-full ${chat.kleur} text-white`}
              >
                <Users className="h-4 w-4" />
              </div>
            ) : (
              <img
                src={chat.avatar}
                alt={chat.van}
                className="h-10 w-10 rounded-full bg-muted object-cover"
              />
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
                <div
                  key={i}
                  className={`flex items-end gap-2 ${m.mij ? "justify-end" : "justify-start"}`}
                >
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
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.mij ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}
                  >
                    {!m.mij && isGroep && toonAvatar && (
                      <div className="mb-0.5 text-[11px] font-semibold text-primary">{m.van}</div>
                    )}
                    <div>{m.tekst}</div>
                    <div
                      className={`mt-1 text-[10px] ${m.mij ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {m.tijd}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-8 shrink-0">
                  <img
                    src={chat.avatar}
                    alt={chat.van}
                    className="h-8 w-8 rounded-full bg-muted object-cover"
                  />
                </div>
                <div className="rounded-2xl border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce [animation-delay:0ms]">·</span>
                    <span className="animate-bounce [animation-delay:150ms]">·</span>
                    <span className="animate-bounce [animation-delay:300ms]">·</span>
                  </span>
                  &nbsp;{chat.van.split(" ")[0]} typt...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={sendMsg}
            className="flex flex-col gap-2 border-t border-border bg-background p-3"
          >
            {role === "docent" &&
              geplandeBerichten.filter((b) => b.chatId === chat.id).length > 0 && (
                <div className="border-t border-border bg-muted/30 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setGeplandOpen((v) => !v)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                  >
                    <CalendarClock className="h-3.5 w-3.5" /> Ingeplande berichten:{" "}
                    {geplandeBerichten.filter((b) => b.chatId === chat.id).length}
                  </button>
                  {geplandOpen && (
                    <div className="mt-2 space-y-1">
                      {geplandeBerichten
                        .map((b, idx) => ({ ...b, idx }))
                        .filter((b) => b.chatId === chat.id)
                        .map((b) => (
                          <div
                            key={b.idx}
                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                          >
                            <span className="flex-1 truncate">{b.tekst}</span>
                            <span className="shrink-0 text-muted-foreground">
                              {new Date(b.datum).toLocaleString("nl-NL", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setGeplandeBerichten((prev) => prev.filter((_, j) => j !== b.idx))
                              }
                              className="shrink-0 text-destructive hover:text-destructive/80"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            {bijlageNaam && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5 text-xs">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="flex-1 truncate text-muted-foreground">{bijlageNaam}</span>
                <button
                  type="button"
                  onClick={() => setBijlageNaam(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            )}
            {role === "docent" && planOpen && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                <input
                  type="datetime-local"
                  value={planDatum}
                  onChange={(e) => setPlanDatum(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
                />
                <button
                  type="button"
                  disabled={!planDatum || !msg.trim()}
                  onClick={() => {
                    setGeplandeBerichten((prev) => [
                      ...prev,
                      { tekst: msg.trim(), datum: planDatum, chatId: chat.id },
                    ]);
                    setMsg("");
                    setPlanOpen(false);
                    setPlanDatum("");
                    toast.success("Bericht ingepland");
                  }}
                  className="rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                >
                  Inplannen
                </button>
                <button
                  type="button"
                  onClick={() => setPlanOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Annuleren
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="cursor-pointer rounded-lg p-2 hover:bg-muted" aria-label="Bijlage">
                <Paperclip className="h-4 w-4" />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setBijlageNaam(file.name);
                      toast.success(`Bijlage "${file.name}" toegevoegd`);
                    }
                    e.target.value = "";
                  }}
                />
              </label>
              {role === "docent" && (
                <button
                  type="button"
                  onClick={() => setPlanOpen((v) => !v)}
                  className={`rounded-lg p-2 hover:bg-muted ${planOpen ? "bg-muted text-primary" : ""}`}
                  aria-label="Inplannen"
                >
                  <CalendarClock className="h-4 w-4" />
                </button>
              )}
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Type een bericht..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!msg.trim() && !bijlageNaam}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> Versturen
              </button>
            </div>
          </form>
        </section>
      </div>

      {nieuwChatOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setNieuwChatOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="h-5 w-5 text-primary" />
                <div className="text-sm font-semibold">Nieuwe conversatie starten</div>
              </div>
              <button
                onClick={() => setNieuwChatOpen(false)}
                className="rounded-lg p-1.5 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={ncSearch}
                  onChange={(e) => setNcSearch(e.target.value)}
                  placeholder="Zoek persoon..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2.5">
                <input
                  type="checkbox"
                  checked={ncGroep}
                  onChange={(e) => setNcGroep(e.target.checked)}
                  className="accent-primary"
                />
                <div className="text-xs font-semibold">Groepschat aanmaken</div>
              </label>
              {ncGroep && (
                <input
                  value={ncGroepNaam}
                  onChange={(e) => setNcGroepNaam(e.target.value)}
                  placeholder="Naam van de groep"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              )}
              <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <UserPlus className="h-3.5 w-3.5" /> Selecteer contacten
              </div>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {contacten
                  .filter(
                    (c) =>
                      !ncSearch.trim() || c.naam.toLowerCase().includes(ncSearch.toLowerCase()),
                  )
                  .map((c) => (
                    <label
                      key={c.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-colors ${ncSelected.includes(c.id) ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <input
                        type="checkbox"
                        checked={ncSelected.includes(c.id)}
                        onChange={(e) =>
                          setNcSelected((s) =>
                            e.target.checked ? [...s, c.id] : s.filter((x) => x !== c.id),
                          )
                        }
                        className="accent-primary"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{c.naam}</div>
                        <div className="text-[11px] text-muted-foreground">{c.rol}</div>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-3">
              <button
                onClick={() => setNieuwChatOpen(false)}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                Annuleren
              </button>
              <button
                disabled={ncSelected.length === 0}
                onClick={() => {
                  const personen = ncSelected
                    .map((id) => contacten.find((c) => c.id === id)!)
                    .filter(Boolean);
                  const newId = `nc-${Date.now()}`;
                  const titel = ncGroep
                    ? ncGroepNaam.trim() ||
                      `Groep (${personen.map((p) => p.naam.split(" ")[0]).join(", ")})`
                    : personen[0].naam;
                  const type = ncGroep ? ("groep" as const) : ("docent" as const);
                  const newChat = {
                    id: newId,
                    van: titel,
                    rol: ncGroep ? `Groepschat · ${personen.length} leden` : personen[0].rol,
                    tijd: new Date().toLocaleTimeString("nl-NL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    preview: "Conversatie gestart",
                    ongelezen: false,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(titel)}`,
                    kleur: "bg-violet-500",
                    type,
                    thread: [] as import("@/lib/demo-data").ChatBericht[],
                  };
                  setExtraChats((prev) => [...prev, newChat]);
                  setThreads((prev) => ({ ...prev, [newId]: [] }));
                  setSelectedId(newId);
                  setMobileDetail(true);
                  setNieuwChatOpen(false);
                  setNcSearch("");
                  setNcGroep(false);
                  setNcGroepNaam("");
                  setNcSelected([]);
                  toast.success(
                    ncGroep ? `Groepschat "${titel}" aangemaakt` : `Gesprek met ${titel} gestart`,
                  );
                }}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Start gesprek
              </button>
            </div>
          </div>
        </div>
      )}

      {schoolBreedOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSchoolBreedOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                <div className="text-sm font-semibold">Schoolbrede mededeling</div>
              </div>
              <button
                onClick={() => setSchoolBreedOpen(false)}
                className="rounded-lg p-1.5 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Doelgroep
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(["leerlingen", "ouders", "docenten", "teamleiders"] as const).map((g) => {
                    const labels: Record<string, string> = {
                      leerlingen: "Alle leerlingen",
                      ouders: "Alle ouders",
                      docenten: "Alle docenten",
                      teamleiders: "Teamleiders",
                    };
                    const counts: Record<string, number> = {
                      leerlingen: 1284,
                      ouders: 1100,
                      docenten: 48,
                      teamleiders: 6,
                    };
                    return (
                      <label
                        key={g}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 transition-colors ${sbDoelgroepen[g] ? "border-primary bg-primary/5" : "border-border"}`}
                      >
                        <input
                          type="checkbox"
                          checked={sbDoelgroepen[g]}
                          onChange={(e) =>
                            setSbDoelgroepen((d) => ({ ...d, [g]: e.target.checked }))
                          }
                          className="accent-primary"
                        />
                        <div>
                          <div className="text-xs font-semibold">{labels[g]}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {counts[g]} ontvangers
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Onderwerp
                </span>
                <input
                  value={sbOnderwerp}
                  onChange={(e) => setSbOnderwerp(e.target.value)}
                  placeholder="Onderwerp van de mededeling"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Bericht
                </span>
                <textarea
                  rows={4}
                  value={sbBericht}
                  onChange={(e) => setSbBericht(e.target.value)}
                  placeholder="Schrijf hier de mededeling..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
            <div className="flex items-center justify-between border-t border-border p-4">
              <div className="text-xs text-muted-foreground">
                {Object.values(sbDoelgroepen).some(Boolean)
                  ? `Verstuurd naar ${[sbDoelgroepen.leerlingen ? 1284 : 0, sbDoelgroepen.ouders ? 1100 : 0, sbDoelgroepen.docenten ? 48 : 0, sbDoelgroepen.teamleiders ? 6 : 0].reduce((a, b) => a + b, 0)} personen`
                  : "Selecteer een doelgroep"}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSchoolBreedOpen(false)}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                >
                  Annuleren
                </button>
                <button
                  disabled={
                    !Object.values(sbDoelgroepen).some(Boolean) ||
                    !sbOnderwerp.trim() ||
                    !sbBericht.trim()
                  }
                  onClick={() => {
                    const count = [
                      sbDoelgroepen.leerlingen ? 1284 : 0,
                      sbDoelgroepen.ouders ? 1100 : 0,
                      sbDoelgroepen.docenten ? 48 : 0,
                      sbDoelgroepen.teamleiders ? 6 : 0,
                    ].reduce((a, b) => a + b, 0);
                    setSchoolBreedOpen(false);
                    setSbOnderwerp("");
                    setSbBericht("");
                    setSbDoelgroepen({
                      leerlingen: false,
                      ouders: false,
                      docenten: false,
                      teamleiders: false,
                    });
                    toast.success(`Mededeling verstuurd naar ${count} ontvangers`);
                  }}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  Verstuur naar{" "}
                  {[
                    sbDoelgroepen.leerlingen ? 1284 : 0,
                    sbDoelgroepen.ouders ? 1100 : 0,
                    sbDoelgroepen.docenten ? 48 : 0,
                    sbDoelgroepen.teamleiders ? 6 : 0,
                  ].reduce((a, b) => a + b, 0)}{" "}
                  personen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
