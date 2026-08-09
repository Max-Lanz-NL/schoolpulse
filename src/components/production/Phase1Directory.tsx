import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Building2, GraduationCap, RefreshCw, Shield, Users } from "lucide-react";
import type { ProductionProfile } from "@/domains/identity/types";
import { listSchoolIdentities } from "@/domains/identity/services/identity-service";
import { usePeopleDirectory } from "@/domains/people/queries/use-people-directory";
import { useSchoolStructure } from "@/domains/school/queries/use-school-structure";
import { readableDomainError } from "@/domains/shared/domain-error";

export function Phase1Directory({
  entity,
  profile,
  supabase,
}: {
  entity: "student" | "staff" | "school_structure" | "user_management";
  profile: ProductionProfile;
  supabase: SupabaseClient;
}) {
  const people = usePeopleDirectory(supabase, profile.school_id);
  const structure = useSchoolStructure(supabase, profile.school_id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [identities, setIdentities] = useState<Awaited<
    ReturnType<typeof listSchoolIdentities>
  > | null>(null);
  const [identityError, setIdentityError] = useState<string | null>(null);

  useEffect(() => {
    if (entity !== "user_management" || !profile.school_id) return;
    void listSchoolIdentities(supabase, profile.school_id)
      .then(setIdentities)
      .catch((error) => setIdentityError(readableDomainError(error)));
  }, [entity, profile.school_id, supabase]);

  if (entity === "school_structure")
    return (
      <SchoolStructureView
        loading={structure.loading}
        error={structure.error}
        data={structure.data}
        onReload={structure.reload}
      />
    );
  if (entity === "user_management")
    return (
      <IdentityView
        loading={!identities && !identityError}
        error={identityError}
        data={identities}
      />
    );
  if (people.loading) return <LoadingState />;
  if (people.error) return <ErrorState message={people.error} onRetry={people.reload} />;

  const records = entity === "student" ? (people.data?.students ?? []) : (people.data?.staff ?? []);
  const selected = records.find((record) => record.profile_id === selectedId) ?? records[0] ?? null;
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold">{entity === "student" ? "Leerlingen" : "Personeel"}</h2>
          <p className="text-xs text-muted-foreground">
            Echte gegevens uit de officiële People-tabellen.
          </p>
        </div>
        {records.length === 0 ? (
          <EmptyState label={entity === "student" ? "leerlingen" : "personeelsleden"} />
        ) : (
          <div className="divide-y divide-border">
            {records.map((record) => (
              <button
                key={record.id}
                onClick={() => setSelectedId(record.profile_id)}
                className={`flex w-full items-center gap-3 p-4 text-left hover:bg-muted/40 ${selected?.id === record.id ? "bg-primary/5" : ""}`}
              >
                {entity === "student" ? (
                  <GraduationCap className="h-5 w-5 text-primary" />
                ) : (
                  <Users className="h-5 w-5 text-primary" />
                )}
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {record.profile?.full_name || record.profile?.email || "Ongekoppeld profiel"}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {entity === "student"
                      ? `Leerlingnummer ${"student_number" in record ? record.student_number : ""}`
                      : "job_title" in record
                        ? record.job_title || record.department || "Medewerker"
                        : "Medewerker"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        {!selected ? (
          <EmptyState label="details" />
        ) : (
          <>
            <h2 className="text-lg font-bold">
              {selected.profile?.full_name || selected.profile?.email}
            </h2>
            <p className="text-sm text-muted-foreground">{selected.profile?.email}</p>
            <dl className="mt-5 grid gap-3 text-sm">
              {"student_number" in selected ? (
                <>
                  <Detail label="Leerlingnummer" value={selected.student_number} />
                  <Detail label="Status" value={selected.status} />
                  <Detail
                    label="Actieve inschrijving"
                    value={selected.enrolment ? "Gekoppeld" : "Niet gekoppeld"}
                  />
                  <Detail label="Lesgroepen" value={String(selected.groupMemberships.length)} />
                  <Detail label="Ouders/verzorgers" value={String(selected.guardianLinks.length)} />
                </>
              ) : (
                <>
                  <Detail
                    label="Personeelsnummer"
                    value={selected.employee_number || "Niet ingevuld"}
                  />
                  <Detail label="Functie" value={selected.job_title || "Niet ingevuld"} />
                  <Detail label="Afdeling" value={selected.department || "Niet ingevuld"} />
                  <Detail label="Vakken" value={String(selected.subjectAssignments.length)} />
                  <Detail label="Groepen" value={String(selected.groupAssignments.length)} />
                </>
              )}
            </dl>
          </>
        )}
      </section>
    </div>
  );
}

function SchoolStructureView({
  loading,
  error,
  data,
  onReload,
}: {
  loading: boolean;
  error: string | null;
  data: ReturnType<typeof useSchoolStructure>["data"];
  onReload: () => Promise<void>;
}) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={onReload} />;
  if (!data) return <EmptyState label="schoolstructuur" />;
  const groups = [
    { label: "Schooljaren", value: data.years.length },
    { label: "Periodes", value: data.periods.length },
    { label: "Opleidingen", value: data.programmes.length },
    { label: "Vakken", value: data.subjects.length },
    { label: "Klassen", value: data.classes.length },
    { label: "Lesgroepen", value: data.groups.length },
    { label: "Lokalen", value: data.rooms.length },
  ];
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h2 className="font-bold">{data.school.name}</h2>
            <p className="text-sm text-muted-foreground">
              {data.currentYear
                ? `Huidig schooljaar: ${data.currentYear.name}`
                : "Geen huidig schooljaar ingesteld"}
            </p>
          </div>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {groups.map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">{item.label}</div>
            <div className="mt-1 text-2xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IdentityView({
  loading,
  error,
  data,
}: {
  loading: boolean;
  error: string | null;
  data: Awaited<ReturnType<typeof listSchoolIdentities>> | null;
}) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-4">
        <h2 className="font-semibold">Gebruikers en rechten</h2>
        <p className="text-xs text-muted-foreground">
          Accounts en officiële roltoewijzingen van deze school.
        </p>
      </div>
      {!data?.profiles.length ? (
        <EmptyState label="gebruikers" />
      ) : (
        <div className="divide-y divide-border">
          {data.profiles.map((item) => {
            const assigned = data.assignments
              .filter((assignment) => assignment.profile_id === item.id)
              .map((assignment) => data.roles.find((role) => role.id === assignment.role_id)?.name)
              .filter(Boolean);
            return (
              <div key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                <Shield className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{item.full_name || item.email}</div>
                  <div className="truncate text-xs text-muted-foreground">{item.email}</div>
                </div>
                <div className="text-xs font-medium">{assigned.join(" + ") || item.role}</div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-48 place-items-center rounded-2xl border border-border bg-card">
      <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" />
    </div>
  );
}
function EmptyState({ label }: { label: string }) {
  return (
    <div className="p-8 text-center text-sm text-muted-foreground">
      Nog geen {label} beschikbaar.
    </div>
  );
}
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => Promise<void> }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
      <p className="font-semibold">Gegevens niet beschikbaar</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <button
          onClick={() => void onRetry()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Opnieuw proberen
        </button>
      ) : null}
    </div>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
