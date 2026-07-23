import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldQuestion,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import logo from "@/assets/schoolpulse-logo.png";

type ProductionRole = "platform_admin" | "school_admin" | "teacher" | "student" | "parent";

type ProductionProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: ProductionRole;
  school_name: string | null;
  school_id: string | null;
};

type AppRecord = {
  id: string;
  school_id: string;
  entity_type: string;
  title: string;
  description: string | null;
  event_at: string | null;
  status: string;
  updated_at: string;
  metadata?: Record<string, string | boolean>;
  history?: Array<{ at: string; action: string }>;
  created_by?: string;
  owner_profile_id?: string | null;
  audience_profile_ids?: string[];
  visibility?: "private" | "assigned" | "team" | "school";
};

type EffectivePermission = {
  permission_key: string;
  scope: "own" | "assigned" | "team" | "school";
  source_roles: string[];
};

const modules = [
  {
    path: "/app",
    entity: "dashboard",
    permission: "dashboard.view",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/app/rooster",
    entity: "schedule",
    permission: "schedule.view",
    label: "Rooster",
    icon: Calendar,
  },
  {
    path: "/app/cijfers",
    entity: "grade",
    permission: "grades.view",
    label: "Cijfers",
    icon: BarChart3,
  },
  {
    path: "/app/berichten",
    entity: "message",
    permission: "messages.view",
    label: "Berichten",
    icon: MessageSquare,
  },
  {
    path: "/app/opdrachten",
    entity: "assignment",
    permission: "assignments.view",
    label: "Opdrachten",
    icon: BookOpen,
  },
  {
    path: "/app/documenten",
    entity: "document",
    permission: "documents.view",
    label: "Documenten",
    icon: FileText,
  },
  {
    path: "/app/activiteiten",
    entity: "activity",
    permission: "activities.view",
    label: "Activiteiten",
    icon: Activity,
  },
  {
    path: "/app/aanwezigheid",
    entity: "attendance",
    permission: "attendance.view",
    label: "Aanwezigheid",
    icon: CheckCircle2,
  },
  {
    path: "/app/leerlingen",
    entity: "student",
    permission: "students.view",
    label: "Leerlingen",
    icon: Users,
  },
  {
    path: "/app/ouderkoppelingen",
    entity: "parent_link",
    permission: "parents.view",
    label: "Ouder-kindkoppelingen",
    icon: Users,
  },
  {
    path: "/app/huiswerk",
    entity: "homework",
    permission: "homework.view",
    label: "Huiswerk",
    icon: BookOpen,
  },
  {
    path: "/app/studieplanner",
    entity: "study_planner",
    permission: "study_planner.view",
    label: "Studieplanner",
    icon: Calendar,
  },
  {
    path: "/app/agenda",
    entity: "agenda",
    permission: "agenda.view",
    label: "Agenda",
    icon: Calendar,
  },
  {
    path: "/app/absentie",
    entity: "absence",
    permission: "absences.view",
    label: "Absentie",
    icon: Bell,
  },
  {
    path: "/app/gesprekken",
    entity: "conversation",
    permission: "conversations.view",
    label: "Gesprekken",
    icon: MessageSquare,
  },
  {
    path: "/app/toestemming",
    entity: "consent",
    permission: "consent.view",
    label: "Toestemming",
    icon: CheckCircle2,
  },
  {
    path: "/app/toetsen",
    entity: "test",
    permission: "tests.view",
    label: "Toetsen",
    icon: FileText,
  },
  {
    path: "/app/personeel",
    entity: "staff",
    permission: "staff.view",
    label: "Personeel",
    icon: Users,
  },
  {
    path: "/app/vervanging",
    entity: "substitution",
    permission: "substitutions.view",
    label: "Vervanging",
    icon: RefreshCw,
  },
  {
    path: "/app/rapporten",
    entity: "report",
    permission: "reports.view",
    label: "Rapporten",
    icon: BarChart3,
  },
  {
    path: "/app/notificaties",
    entity: "notification",
    permission: "notifications.view",
    label: "Notificaties",
    icon: Bell,
  },
  {
    path: "/app/begeleiding",
    entity: "care",
    permission: "care.view",
    label: "Begeleiding",
    icon: ShieldQuestion,
  },
  {
    path: "/app/integraties",
    entity: "integration",
    permission: "integrations.view",
    label: "Integraties",
    icon: RefreshCw,
  },
  {
    path: "/app/betalingen",
    entity: "payment",
    permission: "payments.view",
    label: "Betalingen",
    icon: FileText,
  },
  {
    path: "/app/gebruikersbeheer",
    entity: "user_management",
    permission: "user_management.view",
    label: "Gebruikersbeheer",
    icon: Users,
  },
  {
    path: "/app/import",
    entity: "data_import",
    permission: "data_import.view",
    label: "Gegevens importeren",
    icon: FileText,
  },
  {
    path: "/app/avg",
    entity: "privacy",
    permission: "privacy.view",
    label: "AVG & privacy",
    icon: ShieldQuestion,
  },
  {
    path: "/app/rechten-aanvragen",
    entity: "permission_requests",
    permission: "permission_requests.create",
    label: "Rechten aanvragen",
    icon: ShieldQuestion,
  },
] as const;

const roleLabels: Record<ProductionRole, string> = {
  platform_admin: "Platformbeheerder",
  school_admin: "Schoolbeheerder",
  teacher: "Docent",
  student: "Leerling",
  parent: "Ouder/verzorger",
};

function moduleForPath(pathname: string) {
  return (
    modules.find((module) => module.path === pathname) ?? {
      path: pathname,
      entity: pathname.replace(/^\/app\/?/, "").replaceAll("/", "_") || "dashboard",
      permission: `${pathname.replace(/^\/app\/?/, "").replaceAll("/", "_") || "dashboard"}.view`,
      label: pathname.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") ?? "Dashboard",
      icon: FileText,
    }
  );
}

function defaultRecordVisibility(entity: string): AppRecord["visibility"] {
  if (["activity", "homework", "agenda", "study_planner"].includes(entity)) return "school";
  if (["staff", "substitution"].includes(entity)) return "team";
  if (["test", "assignment", "attendance"].includes(entity)) return "assigned";
  return "private";
}

export function ProductionApp({
  profile,
  supabase,
  onSignOut,
}: {
  profile: ProductionProfile;
  supabase: SupabaseClient;
  onSignOut: () => Promise<void>;
}) {
  const pathname = useRouterState({
    select: (state: { location: { pathname: string } }) => state.location.pathname,
  });
  const activeModule = moduleForPath(pathname);
  const [records, setRecords] = useState<AppRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventAt, setEventAt] = useState("");
  const [status, setStatus] = useState("concept");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("alle");
  const [weekOffset, setWeekOffset] = useState(0);
  const [guardianEmail, setGuardianEmail] = useState("");
  const [studentReference, setStudentReference] = useState("");
  const [relationship, setRelationship] = useState("parent");
  const [legalAuthority, setLegalAuthority] = useState(true);
  const [receivesCommunication, setReceivesCommunication] = useState(true);
  const [financialResponsibility, setFinancialResponsibility] = useState(false);
  const [subject, setSubject] = useState("");
  const [group, setGroup] = useState("");
  const [weight, setWeight] = useState("1");
  const [assessmentType, setAssessmentType] = useState("cijfer");
  const [score, setScore] = useState("");
  const [maximumScore, setMaximumScore] = useState("10");
  const [feedback, setFeedback] = useState("");
  const [rubricEnabled, setRubricEnabled] = useState(false);
  const [allowResubmit, setAllowResubmit] = useState(false);
  const [historyOpenId, setHistoryOpenId] = useState<string | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<AppRecord[] | null>(null);
  const [person, setPerson] = useState("");
  const [reason, setReason] = useState("");
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [budget, setBudget] = useState("");
  const [department, setDepartment] = useState("");
  const [availability, setAvailability] = useState("");
  const [replacement, setReplacement] = useState("");
  const [notifyInvolved, setNotifyInvolved] = useState(true);
  const [category, setCategory] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [participants, setParticipants] = useState("");
  const [outcome, setOutcome] = useState("");
  const [sensitive, setSensitive] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountRole, setAccountRole] = useState("student");
  const [importMode, setImportMode] = useState("aanvullen");
  const [sourceFile, setSourceFile] = useState("");
  const [retentionPeriod, setRetentionPeriod] = useState("");
  const [consentRequired, setConsentRequired] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replyConversationId, setReplyConversationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [effectivePermissions, setEffectivePermissions] = useState<EffectivePermission[]>([]);
  const [effectiveRank, setEffectiveRank] = useState(0);
  const [accessLoading, setAccessLoading] = useState(true);
  const permissionMap = useMemo(
    () =>
      new Map(effectivePermissions.map((permission) => [permission.permission_key, permission])),
    [effectivePermissions],
  );
  const can = useCallback(
    (permissionKey: string) =>
      profile.role === "platform_admin" || permissionMap.has(permissionKey),
    [permissionMap, profile.role],
  );

  const loadAccess = useCallback(async () => {
    setAccessLoading(true);
    const [{ data: permissionData, error: permissionError }, { data: rankData }] =
      await Promise.all([supabase.rpc("effective_permissions"), supabase.rpc("effective_rank")]);
    if (permissionError) {
      setError(
        "Je rollen en rechten konden niet worden geladen. Controleer of de permissiemigratie is uitgevoerd.",
      );
      setEffectivePermissions([]);
    } else {
      setEffectivePermissions((permissionData ?? []) as EffectivePermission[]);
      setEffectiveRank(Number(rankData ?? 0));
    }
    setAccessLoading(false);
  }, [supabase]);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [
      workspaceResult,
      guardianLinksResult,
      messagesResult,
      assessmentsResult,
      assignmentsResult,
      gradesResult,
    ] = await Promise.all([
      supabase
        .from("app_records")
        .select(
          "id,school_id,entity_type,title,description,event_at,status,payload,created_by,owner_profile_id,audience_profile_ids,visibility,updated_at",
        )
        .order("updated_at", { ascending: false }),
      supabase
        .from("guardian_student_links")
        .select(
          "id,school_id,relationship,has_legal_authority,receives_communication,financial_responsibility,is_active,updated_at,guardian:profiles!guardian_student_links_guardian_profile_id_fkey(email,full_name),student:profiles!guardian_student_links_student_profile_id_fkey(email,full_name)",
        )
        .eq("is_active", true),
      supabase
        .from("messages")
        .select(
          "id,school_id,body,sent_at,edited_at,deleted_at,conversation:conversations!inner(id,subject,kind),sender:profiles!messages_sender_id_fkey(id,email,full_name)",
        )
        .is("deleted_at", null)
        .order("sent_at", { ascending: false })
        .limit(250),
      supabase
        .from("assessments")
        .select(
          "id,school_id,title,assessment_type,occurs_at,maximum_score,weight,status,created_by,updated_at,group:teaching_groups!assessments_teaching_group_id_fkey(name),subject:subjects!assessments_subject_id_fkey(name)",
        )
        .order("updated_at", { ascending: false }),
      supabase
        .from("assignments")
        .select(
          "id,school_id,title,instructions,due_at,status,created_by,updated_at,group:teaching_groups!assignments_teaching_group_id_fkey(name),subject:subjects!assignments_subject_id_fkey(name)",
        )
        .order("updated_at", { ascending: false }),
      supabase
        .from("grades")
        .select(
          "id,school_id,score,grade,note,status,graded_by,graded_at,updated_at,assessment:assessments!grades_assessment_id_fkey(title,weight,maximum_score,assessment_type),student:profiles!grades_student_profile_id_fkey(full_name,email)",
        )
        .order("updated_at", { ascending: false }),
    ]);
    if (workspaceResult.error) {
      setRecords([]);
      setError(
        "De gedeelde schoolgegevens konden niet worden geladen. Controleer de database en je rechten.",
      );
    } else {
      const workspaceRecords = (workspaceResult.data ?? []).map((record) => {
        const payload =
          record.payload && typeof record.payload === "object"
            ? (record.payload as {
                metadata?: Record<string, string | boolean>;
                history?: Array<{ at: string; action: string }>;
              })
            : {};
        return {
          id: record.id,
          school_id: record.school_id,
          entity_type: record.entity_type,
          title: record.title,
          description: record.description,
          event_at: record.event_at,
          status: record.status,
          updated_at: record.updated_at,
          created_by: record.created_by,
          owner_profile_id: record.owner_profile_id,
          audience_profile_ids: record.audience_profile_ids,
          visibility: record.visibility,
          metadata: payload.metadata,
          history: payload.history,
        };
      });
      const guardianRecords: AppRecord[] = guardianLinksResult.error
        ? []
        : (guardianLinksResult.data ?? []).map((link) => {
            const guardian = Array.isArray(link.guardian) ? link.guardian[0] : link.guardian;
            const student = Array.isArray(link.student) ? link.student[0] : link.student;
            return {
              id: link.id,
              school_id: link.school_id,
              entity_type: "parent_link",
              title: `${guardian?.full_name || guardian?.email || "Ouder"} → ${student?.full_name || student?.email || "Leerling"}`,
              description: link.relationship,
              event_at: null,
              status: "actief",
              updated_at: link.updated_at,
              metadata: {
                guardianEmail: guardian?.email ?? "",
                studentReference: student?.email ?? "",
                relationship: link.relationship,
                legalAuthority: link.has_legal_authority,
                receivesCommunication: link.receives_communication,
                financialResponsibility: link.financial_responsibility,
              },
              history: [],
            };
          });
      const messageRecords: AppRecord[] = messagesResult.error
        ? []
        : (messagesResult.data ?? []).map((message) => {
            const conversation = Array.isArray(message.conversation)
              ? message.conversation[0]
              : message.conversation;
            const sender = Array.isArray(message.sender) ? message.sender[0] : message.sender;
            return {
              id: message.id,
              school_id: message.school_id,
              entity_type: "message",
              title: conversation?.subject ?? "Bericht",
              description: message.body,
              event_at: message.sent_at,
              status: "verzonden",
              updated_at: message.edited_at ?? message.sent_at,
              created_by: sender?.id,
              metadata: {
                conversationId: conversation?.id ?? "",
                conversationKind: conversation?.kind ?? "direct",
                sender: sender?.full_name || sender?.email || "Onbekend",
              },
              history: [],
            };
          });
      const assessmentRecords: AppRecord[] = assessmentsResult.error
        ? []
        : (assessmentsResult.data ?? []).map((assessment) => {
            const assessmentGroup = Array.isArray(assessment.group)
              ? assessment.group[0]
              : assessment.group;
            const assessmentSubject = Array.isArray(assessment.subject)
              ? assessment.subject[0]
              : assessment.subject;
            return {
              id: assessment.id,
              school_id: assessment.school_id,
              entity_type: "test",
              title: assessment.title,
              description: assessment.assessment_type,
              event_at: assessment.occurs_at,
              status: assessment.status,
              updated_at: assessment.updated_at,
              created_by: assessment.created_by,
              metadata: {
                domainRecord: true,
                group: assessmentGroup?.name ?? "",
                subject: assessmentSubject?.name ?? "",
                assessmentType: assessment.assessment_type,
                maximumScore: String(assessment.maximum_score ?? ""),
                weight: String(assessment.weight),
              },
              history: [],
            };
          });
      const assignmentRecords: AppRecord[] = assignmentsResult.error
        ? []
        : (assignmentsResult.data ?? []).map((assignment) => {
            const assignmentGroup = Array.isArray(assignment.group)
              ? assignment.group[0]
              : assignment.group;
            const assignmentSubject = Array.isArray(assignment.subject)
              ? assignment.subject[0]
              : assignment.subject;
            return {
              id: assignment.id,
              school_id: assignment.school_id,
              entity_type: "assignment",
              title: assignment.title,
              description: assignment.instructions,
              event_at: assignment.due_at,
              status: assignment.status,
              updated_at: assignment.updated_at,
              created_by: assignment.created_by,
              metadata: {
                domainRecord: true,
                group: assignmentGroup?.name ?? "",
                subject: assignmentSubject?.name ?? "",
              },
              history: [],
            };
          });
      const gradeRecords: AppRecord[] = gradesResult.error
        ? []
        : (gradesResult.data ?? []).map((grade) => {
            const assessment = Array.isArray(grade.assessment)
              ? grade.assessment[0]
              : grade.assessment;
            const student = Array.isArray(grade.student) ? grade.student[0] : grade.student;
            return {
              id: grade.id,
              school_id: grade.school_id,
              entity_type: "grade",
              title: assessment?.title ?? "Cijfer",
              description: grade.note,
              event_at: grade.graded_at,
              status: grade.status,
              updated_at: grade.updated_at,
              created_by: grade.graded_by,
              metadata: {
                domainRecord: true,
                group: student?.full_name || student?.email || "",
                assessmentType: assessment?.assessment_type ?? "cijfer",
                score: String(grade.grade ?? grade.score ?? ""),
                maximumScore: String(assessment?.maximum_score ?? "10"),
                weight: String(assessment?.weight ?? "1"),
              },
              history: [],
            };
          });
      setRecords([
        ...guardianRecords,
        ...messageRecords,
        ...assessmentRecords,
        ...assignmentRecords,
        ...gradeRecords,
        ...workspaceRecords,
      ]);
    }
    setLoading(false);
  }, [supabase]);

  const persistRecords = useCallback(
    async (previousRecords: AppRecord[], nextRecords: AppRecord[]) => {
      const previousById = new Map(previousRecords.map((record) => [record.id, record]));
      const changedRecords = nextRecords.filter(
        (record) => JSON.stringify(previousById.get(record.id)) !== JSON.stringify(record),
      );
      const nextIds = new Set(nextRecords.map((record) => record.id));
      const removedIds = previousRecords
        .filter((record) => !nextIds.has(record.id))
        .map((record) => record.id);

      if (changedRecords.length) {
        const { error: saveError } = await supabase.from("app_records").upsert(
          changedRecords.map((record) => ({
            id: record.id,
            school_id: record.school_id,
            entity_type: record.entity_type,
            title: record.title,
            description: record.description,
            event_at: record.event_at,
            status: record.status,
            payload: {
              metadata: record.metadata ?? {},
              history: record.history ?? [],
            },
            created_by: record.created_by ?? profile.id,
            owner_profile_id: record.owner_profile_id ?? profile.id,
            audience_profile_ids: record.audience_profile_ids ?? [],
            visibility: record.visibility ?? defaultRecordVisibility(record.entity_type),
          })),
        );
        if (saveError) throw saveError;
      }
      if (removedIds.length) {
        const { error: deleteError } = await supabase
          .from("app_records")
          .delete()
          .in("id", removedIds);
        if (deleteError) throw deleteError;
      }
      setRecords(nextRecords);
    },
    [profile.id, supabase],
  );

  const applyRecords = async (nextRecords: AppRecord[]) => {
    const previousRecords = records;
    try {
      await persistRecords(previousRecords, nextRecords);
      setUndoSnapshot(previousRecords);
      return true;
    } catch {
      setError("Opslaan in de gedeelde schooldatabase is mislukt.");
      toast.error("Wijziging niet opgeslagen");
      return false;
    }
  };

  const undoLastChange = async () => {
    if (!undoSnapshot) return;
    const currentRecords = records;
    try {
      await persistRecords(currentRecords, undoSnapshot);
      setUndoSnapshot(currentRecords);
      toast.success("Laatste wijziging ongedaan gemaakt");
    } catch {
      toast.error("Ongedaan maken is mislukt");
    }
  };

  useEffect(() => {
    void loadAccess();
    void loadRecords();

    const channel = supabase.channel(`school-access-${profile.school_id ?? "platform"}`);
    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profile_role_assignments" },
        () => void loadAccess(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "role_permissions" },
        () => void loadAccess(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "school_roles",
          ...(profile.school_id ? { filter: `school_id=eq.${profile.school_id}` } : {}),
        },
        () => void loadAccess(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "app_records",
          ...(profile.school_id ? { filter: `school_id=eq.${profile.school_id}` } : {}),
        },
        () => void loadRecords(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "guardian_student_links",
          ...(profile.school_id ? { filter: `school_id=eq.${profile.school_id}` } : {}),
        },
        () => void loadRecords(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          ...(profile.school_id ? { filter: `school_id=eq.${profile.school_id}` } : {}),
        },
        () => void loadRecords(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadAccess, loadRecords, profile.school_id, supabase]);

  const visibleRecords = useMemo(() => {
    const moduleRecords =
      activeModule.entity === "dashboard"
        ? records
        : records.filter((record) => record.entity_type === activeModule.entity);
    const normalizedSearch = search.trim().toLocaleLowerCase("nl-NL");
    return moduleRecords.filter(
      (record) =>
        (statusFilter === "alle" || record.status === statusFilter) &&
        (!normalizedSearch ||
          record.title.toLocaleLowerCase("nl-NL").includes(normalizedSearch) ||
          record.description?.toLocaleLowerCase("nl-NL").includes(normalizedSearch)),
    );
  }, [activeModule.entity, records, search, statusFilter]);

  const selectedWeek = useMemo(() => {
    const date = new Date();
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1 + weekOffset * 7);
    const end = new Date(date);
    end.setDate(date.getDate() + 6);
    return {
      start: date,
      end,
      label: `${date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}`,
    };
  }, [weekOffset]);

  const resetEditor = () => {
    setTitle("");
    setDescription("");
    setEventAt("");
    setStatus("concept");
    setEditingId(null);
    setGuardianEmail("");
    setStudentReference("");
    setRelationship("parent");
    setLegalAuthority(true);
    setReceivesCommunication(true);
    setFinancialResponsibility(false);
    setSubject("");
    setGroup("");
    setWeight("1");
    setAssessmentType("cijfer");
    setScore("");
    setMaximumScore("10");
    setFeedback("");
    setRubricEnabled(false);
    setAllowResubmit(false);
    setPerson("");
    setReason("");
    setEndAt("");
    setLocation("");
    setCapacity("");
    setBudget("");
    setDepartment("");
    setAvailability("");
    setReplacement("");
    setNotifyInvolved(true);
    setCategory("");
    setAssignedTo("");
    setParticipants("");
    setOutcome("");
    setSensitive(false);
    setAccountEmail("");
    setAccountRole("student");
    setImportMode("aanvullen");
    setSourceFile("");
    setRetentionPeriod("");
    setConsentRequired(false);
    setSelectedFile(null);
    setReplyConversationId(null);
    setEditorOpen(false);
  };

  const saveRecord = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile.school_id) return;
    setSaving(true);
    const isParentLink = activeModule.entity === "parent_link";
    const isEducationRecord = ["grade", "test", "assignment"].includes(activeModule.entity);
    const isOperationsRecord = [
      "attendance",
      "absence",
      "activity",
      "staff",
      "substitution",
    ].includes(activeModule.entity);
    const isAdministrationRecord = [
      "student",
      "conversation",
      "consent",
      "care",
      "report",
      "user_management",
      "data_import",
      "privacy",
    ].includes(activeModule.entity);
    if (isParentLink && (!guardianEmail.trim() || !studentReference.trim())) {
      setSaving(false);
      toast.error("Vul zowel het ouderaccount als de leerling in.");
      return;
    }
    if (!isParentLink && !title.trim()) {
      setSaving(false);
      toast.error("Vul een titel in.");
      return;
    }
    if (isParentLink) {
      const { error: linkError } = await supabase.rpc("manage_guardian_student_link", {
        _guardian_email: guardianEmail.trim().toLocaleLowerCase("nl-NL"),
        _student_reference: studentReference.trim(),
        _relationship: relationship,
        _has_legal_authority: legalAuthority,
        _receives_communication: receivesCommunication,
        _financial_responsibility: financialResponsibility,
      });
      setSaving(false);
      if (linkError) {
        toast.error("Ouder-kindkoppeling niet opgeslagen", {
          description: linkError.message,
        });
        return;
      }
      resetEditor();
      await loadRecords();
      toast.success("Ouder en leerling zijn gekoppeld");
      return;
    }
    if (activeModule.entity === "message") {
      if (replyConversationId) {
        const { error: replyError } = await supabase.rpc("send_school_message", {
          _conversation_id: replyConversationId,
          _body: description.trim(),
        });
        setSaving(false);
        if (replyError) {
          toast.error("Antwoord kon niet worden verzonden", {
            description: replyError.message,
          });
          return;
        }
        resetEditor();
        await loadRecords();
        toast.success("Antwoord verzonden");
        return;
      }
      const participantEmails = participants
        .split(/[;,\n]/)
        .map((value) => value.trim())
        .filter(Boolean);
      const { error: messageError } = await supabase.rpc("create_school_conversation", {
        _subject: title.trim(),
        _body: description.trim(),
        _participant_emails: participantEmails,
        _kind: participantEmails.length > 1 ? "group" : "direct",
      });
      setSaving(false);
      if (messageError) {
        toast.error("Bericht kon niet worden verzonden", {
          description: messageError.message,
        });
        return;
      }
      resetEditor();
      await loadRecords();
      toast.success("Bericht verzonden");
      return;
    }
    if (activeModule.entity === "test") {
      const databaseStatus =
        status === "gepubliceerd" ? "published" : status === "geannuleerd" ? "cancelled" : "draft";
      const { error: assessmentError } = await supabase.rpc("create_school_assessment", {
        _title: title.trim(),
        _group_reference: group.trim(),
        _subject_reference: subject.trim(),
        _assessment_type: assessmentType,
        _occurs_at: eventAt ? new Date(eventAt).toISOString() : null,
        _maximum_score: maximumScore ? Number(maximumScore) : null,
        _weight: Number(weight || "1"),
        _status: databaseStatus,
      });
      setSaving(false);
      if (assessmentError) {
        toast.error("Toets kon niet worden opgeslagen", {
          description: assessmentError.message,
        });
        return;
      }
      resetEditor();
      await loadRecords();
      toast.success("Toets opgeslagen");
      return;
    }
    if (activeModule.entity === "assignment") {
      const databaseStatus = status === "gepubliceerd" ? "published" : "draft";
      const { error: assignmentError } = await supabase.rpc("create_school_assignment", {
        _title: title.trim(),
        _instructions: description.trim(),
        _group_reference: group.trim(),
        _subject_reference: subject.trim(),
        _due_at: eventAt ? new Date(eventAt).toISOString() : null,
        _status: databaseStatus,
      });
      setSaving(false);
      if (assignmentError) {
        toast.error("Opdracht kon niet worden opgeslagen", {
          description: assignmentError.message,
        });
        return;
      }
      resetEditor();
      await loadRecords();
      toast.success("Opdracht opgeslagen");
      return;
    }
    if (activeModule.entity === "grade") {
      const numericResult = score.trim() ? Number(score) : null;
      const databaseStatus = status === "gepubliceerd" ? "published" : "draft";
      const { error: gradeError } = await supabase.rpc("record_school_grade", {
        _assessment_title: title.trim(),
        _student_reference: group.trim(),
        _score: numericResult,
        _grade: assessmentType === "cijfer" ? numericResult : null,
        _note: feedback.trim() || description.trim(),
        _status: databaseStatus,
      });
      setSaving(false);
      if (gradeError) {
        toast.error("Cijfer kon niet worden opgeslagen", {
          description: gradeError.message,
        });
        return;
      }
      resetEditor();
      await loadRecords();
      toast.success(databaseStatus === "published" ? "Cijfer gepubliceerd" : "Cijfer opgeslagen");
      return;
    }
    let documentMetadata: Record<string, string | boolean> | undefined;
    if (activeModule.entity === "document" && selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        setSaving(false);
        toast.error("Bestand is groter dan 50 MB.");
        return;
      }
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
      const storagePath = `${profile.school_id}/${profile.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("school-files")
        .upload(storagePath, selectedFile, { upsert: false });
      if (uploadError) {
        setSaving(false);
        toast.error("Bestand uploaden is mislukt", { description: uploadError.message });
        return;
      }
      const { data: fileAsset, error: assetError } = await supabase
        .from("file_assets")
        .insert({
          school_id: profile.school_id,
          owner_id: profile.id,
          bucket: "school-files",
          storage_path: storagePath,
          file_name: selectedFile.name,
          mime_type: selectedFile.type || null,
          size_bytes: selectedFile.size,
          visibility: "school",
          related_type: "document",
          scan_status: "pending",
        })
        .select("id")
        .single();
      if (assetError) {
        await supabase.storage.from("school-files").remove([storagePath]);
        setSaving(false);
        toast.error("Bestandsregistratie is mislukt", { description: assetError.message });
        return;
      }
      const previousDocument = editingId
        ? records.find((record) => record.id === editingId)
        : undefined;
      if (previousDocument?.metadata?.storagePath) {
        const previousBucket = String(previousDocument.metadata.bucket ?? "school-files");
        await supabase.storage
          .from(previousBucket)
          .remove([String(previousDocument.metadata.storagePath)]);
        if (previousDocument.metadata.fileAssetId) {
          await supabase
            .from("file_assets")
            .delete()
            .eq("id", String(previousDocument.metadata.fileAssetId));
        }
      }
      documentMetadata = {
        fileAssetId: fileAsset.id,
        storagePath,
        bucket: "school-files",
        fileName: selectedFile.name,
        mimeType: selectedFile.type || "application/octet-stream",
        sizeBytes: String(selectedFile.size),
        scanStatus: "pending",
      };
    }
    const nextRecord: AppRecord = {
      id: crypto.randomUUID(),
      school_id: profile.school_id!,
      entity_type: activeModule.entity,
      title: isParentLink
        ? `${guardianEmail.trim().toLocaleLowerCase("nl-NL")} → ${studentReference.trim()}`
        : title.trim(),
      description: description.trim() || null,
      event_at: eventAt ? new Date(eventAt).toISOString() : null,
      status,
      updated_at: new Date().toISOString(),
      created_by: editingId
        ? records.find((record) => record.id === editingId)?.created_by
        : profile.id,
      owner_profile_id: editingId
        ? records.find((record) => record.id === editingId)?.owner_profile_id
        : profile.id,
      audience_profile_ids: editingId
        ? records.find((record) => record.id === editingId)?.audience_profile_ids
        : [],
      visibility: editingId
        ? records.find((record) => record.id === editingId)?.visibility
        : defaultRecordVisibility(activeModule.entity),
      metadata: isParentLink
        ? {
            guardianEmail: guardianEmail.trim().toLocaleLowerCase("nl-NL"),
            studentReference: studentReference.trim(),
            relationship,
            legalAuthority,
            receivesCommunication,
            financialResponsibility,
          }
        : activeModule.entity === "document"
          ? {
              ...(editingId
                ? (records.find((record) => record.id === editingId)?.metadata ?? {})
                : {}),
              ...(documentMetadata ?? {}),
            }
          : isEducationRecord
            ? {
                subject: subject.trim(),
                group: group.trim(),
                weight,
                assessmentType,
                score,
                maximumScore,
                feedback: feedback.trim(),
                rubricEnabled,
                allowResubmit,
              }
            : isOperationsRecord
              ? {
                  person: person.trim(),
                  reason: reason.trim(),
                  endAt,
                  location: location.trim(),
                  capacity,
                  budget,
                  department: department.trim(),
                  availability: availability.trim(),
                  replacement: replacement.trim(),
                  notifyInvolved,
                }
              : isAdministrationRecord
                ? {
                    person: person.trim(),
                    category: category.trim(),
                    assignedTo: assignedTo.trim(),
                    participants: participants.trim(),
                    outcome: outcome.trim(),
                    sensitive,
                    accountEmail: accountEmail.trim().toLocaleLowerCase("nl-NL"),
                    accountRole,
                    importMode,
                    sourceFile: sourceFile.trim(),
                    retentionPeriod: retentionPeriod.trim(),
                    consentRequired,
                  }
                : undefined,
      history: [
        ...(editingId ? (records.find((record) => record.id === editingId)?.history ?? []) : []),
        {
          at: new Date().toISOString(),
          action: editingId ? "Item gewijzigd" : "Item aangemaakt",
        },
      ],
    };
    const saved = await applyRecords(
      editingId
        ? records.map((record) =>
            record.id === editingId ? { ...nextRecord, id: editingId } : record,
          )
        : [nextRecord, ...records],
    );
    setSaving(false);
    if (!saved) return;
    resetEditor();
    toast.success(editingId ? "Wijzigingen opgeslagen" : "Toegevoegd", {
      description: "De wijziging is gedeeld met bevoegde gebruikers van deze school.",
    });
  };

  const editRecord = (record: AppRecord) => {
    setEditingId(record.id);
    setTitle(record.title);
    setDescription(record.description ?? "");
    setEventAt(record.event_at ? record.event_at.slice(0, 16) : "");
    setStatus(record.status);
    setGuardianEmail(String(record.metadata?.guardianEmail ?? ""));
    setStudentReference(String(record.metadata?.studentReference ?? ""));
    setRelationship(String(record.metadata?.relationship ?? "parent"));
    setLegalAuthority(Boolean(record.metadata?.legalAuthority ?? true));
    setReceivesCommunication(Boolean(record.metadata?.receivesCommunication ?? true));
    setFinancialResponsibility(Boolean(record.metadata?.financialResponsibility ?? false));
    setSubject(String(record.metadata?.subject ?? ""));
    setGroup(String(record.metadata?.group ?? ""));
    setWeight(String(record.metadata?.weight ?? "1"));
    setAssessmentType(String(record.metadata?.assessmentType ?? "cijfer"));
    setScore(String(record.metadata?.score ?? ""));
    setMaximumScore(String(record.metadata?.maximumScore ?? "10"));
    setFeedback(String(record.metadata?.feedback ?? ""));
    setRubricEnabled(Boolean(record.metadata?.rubricEnabled ?? false));
    setAllowResubmit(Boolean(record.metadata?.allowResubmit ?? false));
    setPerson(String(record.metadata?.person ?? ""));
    setReason(String(record.metadata?.reason ?? ""));
    setEndAt(String(record.metadata?.endAt ?? ""));
    setLocation(String(record.metadata?.location ?? ""));
    setCapacity(String(record.metadata?.capacity ?? ""));
    setBudget(String(record.metadata?.budget ?? ""));
    setDepartment(String(record.metadata?.department ?? ""));
    setAvailability(String(record.metadata?.availability ?? ""));
    setReplacement(String(record.metadata?.replacement ?? ""));
    setNotifyInvolved(Boolean(record.metadata?.notifyInvolved ?? true));
    setCategory(String(record.metadata?.category ?? ""));
    setAssignedTo(String(record.metadata?.assignedTo ?? ""));
    setParticipants(String(record.metadata?.participants ?? ""));
    setOutcome(String(record.metadata?.outcome ?? ""));
    setSensitive(Boolean(record.metadata?.sensitive ?? false));
    setAccountEmail(String(record.metadata?.accountEmail ?? ""));
    setAccountRole(String(record.metadata?.accountRole ?? "student"));
    setImportMode(String(record.metadata?.importMode ?? "aanvullen"));
    setSourceFile(String(record.metadata?.sourceFile ?? ""));
    setRetentionPeriod(String(record.metadata?.retentionPeriod ?? ""));
    setConsentRequired(Boolean(record.metadata?.consentRequired ?? false));
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const replyToMessage = (record: AppRecord) => {
    const conversationId = String(record.metadata?.conversationId ?? "");
    if (!conversationId) return;
    resetEditor();
    setReplyConversationId(conversationId);
    setTitle(record.title);
    setDescription("");
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const duplicateRecord = async (record: AppRecord) => {
    const saved = await applyRecords([
      {
        ...record,
        id: crypto.randomUUID(),
        created_by: profile.id,
        title: `${record.title} (kopie)`,
        status: "concept",
        updated_at: new Date().toISOString(),
        history: [
          ...(record.history ?? []),
          { at: new Date().toISOString(), action: "Item gekopieerd naar concept" },
        ],
      },
      ...records,
    ]);
    if (saved) toast.success("Kopie als concept toegevoegd");
  };

  const updateRecordStatus = async (record: AppRecord, nextStatus: string) => {
    const saved = await applyRecords(
      records.map((item) =>
        item.id === record.id
          ? {
              ...item,
              status: nextStatus,
              updated_at: new Date().toISOString(),
              history: [
                ...(item.history ?? []),
                {
                  at: new Date().toISOString(),
                  action: `Status gewijzigd naar ${nextStatus}`,
                },
              ],
            }
          : item,
      ),
    );
    if (!saved) return;
    toast.success(
      nextStatus === "gepubliceerd"
        ? "Gepubliceerd"
        : nextStatus === "goedgekeurd"
          ? "Goedgekeurd"
          : nextStatus === "geannuleerd"
            ? "Geannuleerd"
            : "Status bijgewerkt",
    );
  };

  const deleteRecord = async (id: string) => {
    if (!window.confirm("Weet je zeker dat je dit item wilt verwijderen?")) return;
    const selectedRecord = records.find((record) => record.id === id);
    if (selectedRecord?.entity_type === "parent_link") {
      const { error: linkError } = await supabase.rpc("deactivate_guardian_student_link", {
        _link_id: id,
      });
      if (linkError) {
        toast.error("Koppeling kon niet worden beëindigd", {
          description: linkError.message,
        });
        return;
      }
      await loadRecords();
      toast.success("Ouder-kindkoppeling beëindigd");
      return;
    }
    if (selectedRecord?.entity_type === "document" && selectedRecord.metadata?.storagePath) {
      const storagePath = String(selectedRecord.metadata.storagePath);
      const bucket = String(selectedRecord.metadata.bucket ?? "school-files");
      const { error: storageError } = await supabase.storage.from(bucket).remove([storagePath]);
      if (storageError) {
        toast.error("Bestand kon niet uit de opslag worden verwijderd", {
          description: storageError.message,
        });
        return;
      }
      if (selectedRecord.metadata.fileAssetId) {
        const { error: assetError } = await supabase
          .from("file_assets")
          .delete()
          .eq("id", String(selectedRecord.metadata.fileAssetId));
        if (assetError) {
          toast.error("Bestandsregistratie kon niet worden verwijderd", {
            description: assetError.message,
          });
          return;
        }
      }
    }
    const saved = await applyRecords(records.filter((item) => item.id !== id));
    if (saved) toast.success("Item verwijderd");
  };

  const downloadDocument = async (record: AppRecord) => {
    const storagePath = String(record.metadata?.storagePath ?? "");
    if (!storagePath) {
      toast.error("Dit document heeft geen gekoppeld bestand.");
      return;
    }
    const bucket = String(record.metadata?.bucket ?? "school-files");
    const { data, error: downloadError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 60);
    if (downloadError || !data?.signedUrl) {
      toast.error("Downloadlink kon niet worden gemaakt", {
        description: downloadError?.message,
      });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const exportRecords = () => {
    const header = ["Titel", "Omschrijving", "Datum", "Status"];
    const rows = visibleRecords.map((record) => [
      record.title,
      record.description ?? "",
      record.event_at ?? "",
      record.status,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeModule.entity}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Overzicht geëxporteerd");
  };

  const recordPermissionCategory = (entity: string) =>
    ({
      grade: "grades",
      message: "messages",
      assignment: "assignments",
      document: "documents",
      activity: "activities",
      student: "students",
      parent_link: "parents",
    })[entity] ?? entity;
  const canPerform = (entity: string, action: string) => {
    const category = recordPermissionCategory(entity);
    return can(`${category}.${action}`) || can(`${category}.manage`);
  };

  const visibleModules = modules.filter((module) => can(module.permission));
  const canCreate = canPerform(activeModule.entity, "create");
  const canUpdate = canPerform(activeModule.entity, "update");
  const canDelete = canPerform(activeModule.entity, "delete");
  const canPublish = canPerform(activeModule.entity, "publish");
  const canApprove = canPerform(activeModule.entity, "approve");
  const canCancel = canPerform(activeModule.entity, "cancel");
  const canExport =
    can(`${recordPermissionCategory(activeModule.entity)}.export`) || can("dashboard.export");

  if (accessLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-muted/30"
        aria-label="Schoolpulse laden"
      >
        <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" />
      </div>
    );
  }

  if (!can(activeModule.permission)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <ShieldQuestion className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-bold">Geen toegang tot dit onderdeel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Geen van je toegewezen rollen verleent deze permissie. Vraag de directie of
            platformbeheerder om hulp.
          </p>
          <Link
            to="/app"
            className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Naar dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
          <div>
            <div className="text-sm font-bold text-white">Schoolpulse</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Productieomgeving
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 pt-5">
          {visibleModules.map((module) => {
            const Icon = module.icon;
            const active = pathname === module.path;
            return (
              <Link
                key={module.path}
                to={module.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"}`}
              >
                <Icon className="h-4 w-4" /> {module.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="truncate text-sm font-semibold text-white">
            {profile.full_name || profile.email}
          </div>
          <div className="truncate text-xs text-sidebar-foreground/60">
            {effectivePermissions
              .flatMap((permission) => permission.source_roles)
              .filter((value, index, values) => values.indexOf(value) === index)
              .join(" + ") || roleLabels[profile.role]}{" "}
            · rang {effectiveRank}
          </div>
          <button
            onClick={() => void onSignOut()}
            className="mt-3 flex items-center gap-2 text-xs hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Uitloggen
          </button>
        </div>
      </aside>

      <div className="min-h-screen md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-border bg-background/95 px-4 backdrop-blur md:px-8">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold capitalize">{activeModule.label}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {profile.school_name || "Schoolpulse productie"} · lege werkomgeving
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadRecords()}
              className="rounded-lg border border-border p-2 hover:bg-muted"
              aria-label="Vernieuwen"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <Bell className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => void onSignOut()}
              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold md:hidden"
            >
              Uitloggen
            </button>
          </div>
        </header>

        <main className="p-4 md:p-8">
          {activeModule.entity === "permission_requests" ? (
            <PermissionRequestWizard profile={profile} supabase={supabase} />
          ) : activeModule.entity === "dashboard" ? (
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleModules
                .filter(
                  (module) =>
                    module.entity !== "dashboard" && module.entity !== "permission_requests",
                )
                .slice(0, 4)
                .map((module) => (
                  <Link
                    key={module.path}
                    to={module.path}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary"
                  >
                    <div className="text-xs font-medium text-muted-foreground">{module.label}</div>
                    <div className="mt-2 text-3xl font-bold">
                      {records.filter((record) => record.entity_type === module.entity).length}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">actuele items</div>
                  </Link>
                ))}
            </div>
          ) : null}

          {activeModule.entity !== "permission_requests" ? (
            <section className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border p-4 md:p-5">
                <div>
                  <h2 className="font-semibold">
                    {activeModule.entity === "dashboard"
                      ? "Laatste wijzigingen"
                      : activeModule.label}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Gedeelde schoolwerkruimte met beveiligde databaseopslag en realtime verversing.
                  </p>
                </div>
                <div className="flex gap-2">
                  {undoSnapshot && (canUpdate || canCreate || canDelete) ? (
                    <button
                      onClick={undoLastChange}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
                    >
                      <RotateCcw className="h-4 w-4" /> Ongedaan maken
                    </button>
                  ) : null}
                  {canExport && visibleRecords.length > 0 ? (
                    <button
                      onClick={exportRecords}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
                    >
                      <Download className="h-4 w-4" /> Exporteren
                    </button>
                  ) : null}
                  {canCreate && profile.school_id && activeModule.entity !== "dashboard" ? (
                    <button
                      onClick={() => (editorOpen ? resetEditor() : setEditorOpen(true))}
                      className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      <Plus className="h-4 w-4" /> Toevoegen
                    </button>
                  ) : null}
                </div>
              </div>

              {activeModule.entity === "schedule" ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 p-4 md:px-5">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Geselecteerde week
                    </div>
                    <div className="mt-0.5 font-semibold">{selectedWeek.label}</div>
                  </div>
                  <div className="flex overflow-hidden rounded-lg border border-border bg-background">
                    <button
                      onClick={() => setWeekOffset((value) => value - 1)}
                      className="px-3 py-2 text-sm font-semibold hover:bg-muted"
                      aria-label="Vorige week"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setWeekOffset(0)}
                      className="border-x border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
                    >
                      Deze week
                    </button>
                    <button
                      onClick={() => setWeekOffset((value) => value + 1)}
                      className="px-3 py-2 text-sm font-semibold hover:bg-muted"
                      aria-label="Volgende week"
                    >
                      →
                    </button>
                  </div>
                </div>
              ) : null}

              {editorOpen ? (
                <form
                  onSubmit={saveRecord}
                  className="grid gap-3 border-b border-border bg-muted/30 p-4 md:grid-cols-2 md:p-5"
                >
                  {activeModule.entity === "parent_link" ? (
                    <>
                      <input
                        type="email"
                        value={guardianEmail}
                        onChange={(event) => setGuardianEmail(event.target.value)}
                        placeholder="E-mailadres ouder/verzorger"
                        required
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                      <input
                        value={studentReference}
                        onChange={(event) => setStudentReference(event.target.value)}
                        placeholder="Leerlingnummer of leerlingnaam"
                        required
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                      <select
                        value={relationship}
                        onChange={(event) => setRelationship(event.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="parent">Ouder</option>
                        <option value="guardian">Voogd</option>
                        <option value="foster_parent">Pleegouder</option>
                        <option value="stepparent">Stiefouder</option>
                        <option value="other">Andere verzorger</option>
                      </select>
                      <div className="space-y-2 rounded-lg border border-border bg-background p-3 text-sm">
                        {[
                          ["Heeft wettelijk gezag", legalAuthority, setLegalAuthority],
                          [
                            "Ontvangt schoolcommunicatie",
                            receivesCommunication,
                            setReceivesCommunication,
                          ],
                          [
                            "Financieel verantwoordelijk",
                            financialResponsibility,
                            setFinancialResponsibility,
                          ],
                        ].map(([label, checked, setter]) => (
                          <label key={String(label)} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(checked)}
                              onChange={(event) =>
                                (setter as React.Dispatch<React.SetStateAction<boolean>>)(
                                  event.target.checked,
                                )
                              }
                            />
                            {String(label)}
                          </label>
                        ))}
                      </div>
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Interne toelichting (optioneel)"
                        rows={2}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2"
                      />
                    </>
                  ) : (
                    <>
                      <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Titel"
                        required
                        disabled={Boolean(replyConversationId)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={eventAt}
                        onChange={(event) => setEventAt(event.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Omschrijving"
                        rows={3}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2"
                      />
                      {activeModule.entity === "message" && !replyConversationId ? (
                        <input
                          value={participants}
                          onChange={(event) => setParticipants(event.target.value)}
                          placeholder="Ontvangers: school-e-mailadressen, gescheiden met komma's"
                          required
                          className="rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2"
                        />
                      ) : null}
                      {activeModule.entity === "document" ? (
                        <label className="rounded-lg border border-dashed border-border bg-background p-3 text-sm md:col-span-2">
                          <span className="mb-2 block font-semibold">Bestand uploaden</span>
                          <input
                            type="file"
                            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.webp"
                            className="block w-full text-xs"
                          />
                          <span className="mt-2 block text-xs text-muted-foreground">
                            Maximaal 50 MB. Gedeelde toegang volgt pas nadat de veiligheidsscan
                            gereed is.
                          </span>
                        </label>
                      ) : null}
                      {["grade", "test", "assignment"].includes(activeModule.entity) ? (
                        <>
                          <input
                            value={subject}
                            onChange={(event) => setSubject(event.target.value)}
                            placeholder="Vak"
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          />
                          <input
                            value={group}
                            onChange={(event) => setGroup(event.target.value)}
                            placeholder={
                              activeModule.entity === "grade"
                                ? "Leerling en/of klas"
                                : "Klas of lesgroep"
                            }
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          />
                          <select
                            value={assessmentType}
                            onChange={(event) => setAssessmentType(event.target.value)}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          >
                            <option value="cijfer">Cijfer</option>
                            <option value="voldoende_onvoldoende">Voldoende/onvoldoende</option>
                            <option value="punten">Punten</option>
                            <option value="rubric">Rubric</option>
                          </select>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={weight}
                            onChange={(event) => setWeight(event.target.value)}
                            placeholder="Weging"
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          />
                          {activeModule.entity === "grade" ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={score}
                                onChange={(event) => setScore(event.target.value)}
                                placeholder="Score of cijfer"
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              />
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={maximumScore}
                                onChange={(event) => setMaximumScore(event.target.value)}
                                placeholder="Maximum"
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              />
                            </>
                          ) : null}
                          <textarea
                            value={feedback}
                            onChange={(event) => setFeedback(event.target.value)}
                            placeholder={
                              activeModule.entity === "assignment"
                                ? "Feedback of nakijkinstructie"
                                : "Opmerking of beoordelingsinstructie"
                            }
                            rows={2}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2"
                          />
                          <div className="flex flex-wrap gap-5 rounded-lg border border-border bg-background p-3 text-sm md:col-span-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={rubricEnabled}
                                onChange={(event) => setRubricEnabled(event.target.checked)}
                              />
                              Rubric gebruiken
                            </label>
                            {activeModule.entity === "assignment" ? (
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={allowResubmit}
                                  onChange={(event) => setAllowResubmit(event.target.checked)}
                                />
                                Opnieuw inleveren toestaan
                              </label>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                      {["attendance", "absence", "activity", "staff", "substitution"].includes(
                        activeModule.entity,
                      ) ? (
                        <>
                          {activeModule.entity !== "activity" ? (
                            <input
                              value={person}
                              onChange={(event) => setPerson(event.target.value)}
                              placeholder={
                                activeModule.entity === "substitution"
                                  ? "Afwezige docent"
                                  : activeModule.entity === "staff"
                                    ? "Naam medewerker"
                                    : "Leerling of medewerker"
                              }
                              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            />
                          ) : null}
                          {["attendance", "absence", "substitution"].includes(
                            activeModule.entity,
                          ) ? (
                            <input
                              value={reason}
                              onChange={(event) => setReason(event.target.value)}
                              placeholder="Reden of toelichting"
                              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            />
                          ) : null}
                          {["attendance", "absence", "substitution", "activity"].includes(
                            activeModule.entity,
                          ) ? (
                            <input
                              type="datetime-local"
                              value={endAt}
                              onChange={(event) => setEndAt(event.target.value)}
                              aria-label="Einddatum en tijd"
                              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            />
                          ) : null}
                          {activeModule.entity === "activity" ? (
                            <>
                              <input
                                value={location}
                                onChange={(event) => setLocation(event.target.value)}
                                placeholder="Locatie"
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              />
                              <input
                                type="number"
                                min="0"
                                value={capacity}
                                onChange={(event) => setCapacity(event.target.value)}
                                placeholder="Maximum aantal deelnemers"
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              />
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={budget}
                                onChange={(event) => setBudget(event.target.value)}
                                placeholder="Budget in euro"
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              />
                            </>
                          ) : null}
                          {activeModule.entity === "staff" ? (
                            <>
                              <input
                                value={department}
                                onChange={(event) => setDepartment(event.target.value)}
                                placeholder="Functie of afdeling"
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              />
                              <input
                                value={availability}
                                onChange={(event) => setAvailability(event.target.value)}
                                placeholder="Beschikbaarheid"
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              />
                            </>
                          ) : null}
                          {activeModule.entity === "substitution" ? (
                            <input
                              value={replacement}
                              onChange={(event) => setReplacement(event.target.value)}
                              placeholder="Vervangende docent"
                              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            />
                          ) : null}
                          <label className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm md:col-span-2">
                            <input
                              type="checkbox"
                              checked={notifyInvolved}
                              onChange={(event) => setNotifyInvolved(event.target.checked)}
                            />
                            Betrokken gebruikers informeren bij statuswijzigingen
                          </label>
                        </>
                      ) : null}
                      {[
                        "student",
                        "conversation",
                        "consent",
                        "care",
                        "report",
                        "user_management",
                        "data_import",
                        "privacy",
                      ].includes(activeModule.entity) ? (
                        <>
                          {!["user_management", "data_import"].includes(activeModule.entity) ? (
                            <input
                              value={person}
                              onChange={(event) => setPerson(event.target.value)}
                              placeholder={
                                activeModule.entity === "student"
                                  ? "Naam of leerlingnummer"
                                  : "Betrokken leerling, medewerker of aanvrager"
                              }
                              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            />
                          ) : null}
                          {activeModule.entity === "user_management" ? (
                            <>
                              <input
                                type="email"
                                value={accountEmail}
                                onChange={(event) => setAccountEmail(event.target.value)}
                                placeholder="E-mailadres account"
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              />
                              <select
                                value={accountRole}
                                onChange={(event) => setAccountRole(event.target.value)}
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              >
                                <option value="student">Leerling</option>
                                <option value="parent">Ouder/verzorger</option>
                                <option value="teacher">Docent</option>
                                <option value="mentor">Mentor</option>
                                <option value="team_leader">Teamleider</option>
                                <option value="director">Directie</option>
                                <option value="administration">Administratie</option>
                                <option value="custom">Aangepaste rol</option>
                              </select>
                            </>
                          ) : null}
                          {activeModule.entity === "data_import" ? (
                            <>
                              <input
                                value={sourceFile}
                                onChange={(event) => setSourceFile(event.target.value)}
                                placeholder="Bestandsnaam of importbron"
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              />
                              <select
                                value={importMode}
                                onChange={(event) => setImportMode(event.target.value)}
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                              >
                                <option value="controleren">Alleen controleren</option>
                                <option value="aanvullen">Bestaande gegevens aanvullen</option>
                                <option value="bijwerken">Bestaande gegevens bijwerken</option>
                                <option value="overschrijven">
                                  Bestaande gegevens overschrijven
                                </option>
                              </select>
                            </>
                          ) : null}
                          <input
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            placeholder={
                              activeModule.entity === "privacy"
                                ? "AVG-verzoek, datalek of bewaartermijn"
                                : activeModule.entity === "report"
                                  ? "Rapporttype of periode"
                                  : "Categorie, klas of onderwerp"
                            }
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          />
                          {["conversation", "care", "report", "privacy"].includes(
                            activeModule.entity,
                          ) ? (
                            <input
                              value={assignedTo}
                              onChange={(event) => setAssignedTo(event.target.value)}
                              placeholder="Verantwoordelijke medewerker"
                              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            />
                          ) : null}
                          {activeModule.entity === "conversation" ? (
                            <input
                              value={participants}
                              onChange={(event) => setParticipants(event.target.value)}
                              placeholder="Deelnemers"
                              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            />
                          ) : null}
                          {["conversation", "care", "report", "privacy"].includes(
                            activeModule.entity,
                          ) ? (
                            <textarea
                              value={outcome}
                              onChange={(event) => setOutcome(event.target.value)}
                              placeholder="Uitkomst, actiepunten of conclusie"
                              rows={2}
                              className="rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2"
                            />
                          ) : null}
                          {activeModule.entity === "privacy" ? (
                            <input
                              value={retentionPeriod}
                              onChange={(event) => setRetentionPeriod(event.target.value)}
                              placeholder="Bewaartermijn of afhandeltermijn"
                              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            />
                          ) : null}
                          <div className="flex flex-wrap gap-5 rounded-lg border border-border bg-background p-3 text-sm md:col-span-2">
                            {["care", "conversation", "privacy"].includes(activeModule.entity) ? (
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={sensitive}
                                  onChange={(event) => setSensitive(event.target.checked)}
                                />
                                Gevoelige of vertrouwelijke informatie
                              </label>
                            ) : null}
                            {["activity", "consent", "care"].includes(activeModule.entity) ? (
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={consentRequired}
                                  onChange={(event) => setConsentRequired(event.target.checked)}
                                />
                                Toestemming vereist
                              </label>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                    </>
                  )}
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="concept">Concept</option>
                    <option value="aangevraagd">Aangevraagd</option>
                    <option value="actief">Actief</option>
                    <option value="aanwezig">Aanwezig</option>
                    <option value="afwezig">Afwezig</option>
                    <option value="te_laat">Te laat</option>
                    <option value="afgerond">Afgerond</option>
                    <option value="geannuleerd">Geannuleerd</option>
                  </select>
                  <div className="flex gap-2 md:col-span-2">
                    <button
                      disabled={saving}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      {saving ? "Opslaan…" : "Opslaan"}
                    </button>
                    <button
                      type="button"
                      onClick={resetEditor}
                      className="rounded-lg border border-border px-4 py-2 text-sm"
                    >
                      Annuleren
                    </button>
                  </div>
                </form>
              ) : null}

              <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[1fr_180px] md:p-5">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={`Zoeken in ${activeModule.label.toLocaleLowerCase("nl-NL")}`}
                    className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm"
                  />
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="alle">Alle statussen</option>
                  <option value="concept">Concept</option>
                  <option value="actief">Actief</option>
                  <option value="aangevraagd">Aangevraagd</option>
                  <option value="aanwezig">Aanwezig</option>
                  <option value="afwezig">Afwezig</option>
                  <option value="te_laat">Te laat</option>
                  <option value="goedgekeurd">Goedgekeurd</option>
                  <option value="afgewezen">Afgewezen</option>
                  <option value="gepubliceerd">Gepubliceerd</option>
                  <option value="afgerond">Afgerond</option>
                  <option value="geannuleerd">Geannuleerd</option>
                </select>
              </div>

              {loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Productiedata laden…
                </div>
              ) : null}
              {error ? (
                <div className="m-5 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              ) : null}
              {!loading && !error && visibleRecords.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="text-sm font-semibold">Nog geen gegevens</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Deze productieomgeving toont bewust geen voorbeelddata. Nieuwe items blijven
                    voorlopig alleen op dit apparaat bewaard.
                  </p>
                </div>
              ) : null}
              <div className="divide-y divide-border">
                {visibleRecords.map((record) => (
                  <article key={record.id} className="flex gap-4 p-4 md:p-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{record.title}</h3>
                        {activeModule.entity === "dashboard" ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            {record.entity_type}
                          </span>
                        ) : null}
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold capitalize text-muted-foreground">
                          {record.status}
                        </span>
                      </div>
                      {record.description ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                          {record.description}
                        </p>
                      ) : null}
                      {record.entity_type === "parent_link" ? (
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                          <span className="rounded-full bg-muted px-2 py-1">
                            Relatie:{" "}
                            {{
                              parent: "ouder",
                              guardian: "voogd",
                              foster_parent: "pleegouder",
                              stepparent: "stiefouder",
                              other: "andere verzorger",
                            }[String(record.metadata?.relationship)] ?? "onbekend"}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-1">
                            {record.metadata?.legalAuthority ? "Met gezag" : "Zonder gezag"}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-1">
                            {record.metadata?.receivesCommunication
                              ? "Ontvangt communicatie"
                              : "Geen communicatie"}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-1">
                            {record.metadata?.financialResponsibility
                              ? "Financieel verantwoordelijk"
                              : "Niet financieel verantwoordelijk"}
                          </span>
                        </div>
                      ) : null}
                      {["grade", "test", "assignment"].includes(record.entity_type) ? (
                        <div className="mt-2 space-y-2">
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {record.metadata?.subject ? (
                              <span className="rounded-full bg-muted px-2 py-1">
                                Vak: {String(record.metadata.subject)}
                              </span>
                            ) : null}
                            {record.metadata?.group ? (
                              <span className="rounded-full bg-muted px-2 py-1">
                                Klas/leerling: {String(record.metadata.group)}
                              </span>
                            ) : null}
                            <span className="rounded-full bg-muted px-2 py-1">
                              Weging: {String(record.metadata?.weight ?? "1")}
                            </span>
                            {record.entity_type === "grade" && record.metadata?.score ? (
                              <span className="rounded-full bg-primary/10 px-2 py-1 font-semibold text-primary">
                                Resultaat: {String(record.metadata.score)} /{" "}
                                {String(record.metadata.maximumScore ?? "10")}
                              </span>
                            ) : null}
                            {record.metadata?.rubricEnabled ? (
                              <span className="rounded-full bg-muted px-2 py-1">Met rubric</span>
                            ) : null}
                            {record.metadata?.allowResubmit ? (
                              <span className="rounded-full bg-muted px-2 py-1">
                                Opnieuw inleveren toegestaan
                              </span>
                            ) : null}
                          </div>
                          {record.metadata?.feedback ? (
                            <div className="rounded-lg border border-border bg-muted/30 p-2 text-xs text-muted-foreground">
                              {String(record.metadata.feedback)}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {["attendance", "absence", "activity", "staff", "substitution"].includes(
                        record.entity_type,
                      ) ? (
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                          {record.metadata?.person ? (
                            <span className="rounded-full bg-muted px-2 py-1">
                              Betrokkene: {String(record.metadata.person)}
                            </span>
                          ) : null}
                          {record.metadata?.reason ? (
                            <span className="rounded-full bg-muted px-2 py-1">
                              Reden: {String(record.metadata.reason)}
                            </span>
                          ) : null}
                          {record.metadata?.endAt ? (
                            <span className="rounded-full bg-muted px-2 py-1">
                              Tot: {new Date(String(record.metadata.endAt)).toLocaleString("nl-NL")}
                            </span>
                          ) : null}
                          {record.metadata?.location ? (
                            <span className="rounded-full bg-muted px-2 py-1">
                              Locatie: {String(record.metadata.location)}
                            </span>
                          ) : null}
                          {record.metadata?.capacity ? (
                            <span className="rounded-full bg-muted px-2 py-1">
                              Capaciteit: {String(record.metadata.capacity)}
                            </span>
                          ) : null}
                          {record.metadata?.budget ? (
                            <span className="rounded-full bg-muted px-2 py-1">
                              Budget: € {String(record.metadata.budget)}
                            </span>
                          ) : null}
                          {record.metadata?.department ? (
                            <span className="rounded-full bg-muted px-2 py-1">
                              Afdeling: {String(record.metadata.department)}
                            </span>
                          ) : null}
                          {record.metadata?.availability ? (
                            <span className="rounded-full bg-muted px-2 py-1">
                              Beschikbaar: {String(record.metadata.availability)}
                            </span>
                          ) : null}
                          {record.metadata?.replacement ? (
                            <span className="rounded-full bg-primary/10 px-2 py-1 font-semibold text-primary">
                              Vervanger: {String(record.metadata.replacement)}
                            </span>
                          ) : null}
                          <span className="rounded-full bg-muted px-2 py-1">
                            {record.metadata?.notifyInvolved
                              ? "Meldingen ingeschakeld"
                              : "Geen meldingen"}
                          </span>
                        </div>
                      ) : null}
                      {[
                        "student",
                        "conversation",
                        "consent",
                        "care",
                        "report",
                        "user_management",
                        "data_import",
                        "privacy",
                      ].includes(record.entity_type) ? (
                        <div className="mt-2 space-y-2">
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {record.metadata?.person ? (
                              <span className="rounded-full bg-muted px-2 py-1">
                                Betrokkene: {String(record.metadata.person)}
                              </span>
                            ) : null}
                            {record.metadata?.category ? (
                              <span className="rounded-full bg-muted px-2 py-1">
                                Categorie: {String(record.metadata.category)}
                              </span>
                            ) : null}
                            {record.metadata?.assignedTo ? (
                              <span className="rounded-full bg-muted px-2 py-1">
                                Verantwoordelijke: {String(record.metadata.assignedTo)}
                              </span>
                            ) : null}
                            {record.metadata?.participants ? (
                              <span className="rounded-full bg-muted px-2 py-1">
                                Deelnemers: {String(record.metadata.participants)}
                              </span>
                            ) : null}
                            {record.metadata?.accountEmail ? (
                              <span className="rounded-full bg-muted px-2 py-1">
                                Account: {String(record.metadata.accountEmail)}
                              </span>
                            ) : null}
                            {record.metadata?.accountRole ? (
                              <span className="rounded-full bg-muted px-2 py-1">
                                Rol: {String(record.metadata.accountRole)}
                              </span>
                            ) : null}
                            {record.metadata?.sourceFile ? (
                              <span className="rounded-full bg-muted px-2 py-1">
                                Bron: {String(record.metadata.sourceFile)}
                              </span>
                            ) : null}
                            {record.metadata?.importMode ? (
                              <span className="rounded-full bg-muted px-2 py-1">
                                Importmodus: {String(record.metadata.importMode)}
                              </span>
                            ) : null}
                            {record.metadata?.retentionPeriod ? (
                              <span className="rounded-full bg-muted px-2 py-1">
                                Termijn: {String(record.metadata.retentionPeriod)}
                              </span>
                            ) : null}
                            {record.metadata?.sensitive ? (
                              <span className="rounded-full bg-destructive/10 px-2 py-1 font-semibold text-destructive">
                                Vertrouwelijk
                              </span>
                            ) : null}
                            {record.metadata?.consentRequired ? (
                              <span className="rounded-full bg-warning/10 px-2 py-1 font-semibold text-warning">
                                Toestemming vereist
                              </span>
                            ) : null}
                          </div>
                          {record.metadata?.outcome ? (
                            <div className="rounded-lg border border-border bg-muted/30 p-2 text-xs text-muted-foreground">
                              {String(record.metadata.outcome)}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {record.history?.length ? (
                        <div className="mt-2">
                          <button
                            onClick={() =>
                              setHistoryOpenId((current) =>
                                current === record.id ? null : record.id,
                              )
                            }
                            className="text-[11px] font-semibold text-primary"
                          >
                            Wijzigingsgeschiedenis ({record.history.length})
                          </button>
                          {historyOpenId === record.id ? (
                            <ol className="mt-2 space-y-1 border-l-2 border-border pl-3 text-[11px] text-muted-foreground">
                              {[...record.history].reverse().map((entry, index) => (
                                <li key={`${entry.at}-${index}`}>
                                  {entry.action} · {new Date(entry.at).toLocaleString("nl-NL")}
                                </li>
                              ))}
                            </ol>
                          ) : null}
                        </div>
                      ) : null}
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        {record.event_at
                          ? new Date(record.event_at).toLocaleString("nl-NL")
                          : `Bijgewerkt ${new Date(record.updated_at).toLocaleString("nl-NL")}`}
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1">
                      {record.entity_type === "message" && record.metadata?.conversationId ? (
                        <button
                          onClick={() => replyToMessage(record)}
                          className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
                        >
                          Reageren
                        </button>
                      ) : null}
                      {record.entity_type === "document" && record.metadata?.storagePath ? (
                        <button
                          onClick={() => downloadDocument(record)}
                          className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
                        >
                          Downloaden
                        </button>
                      ) : null}
                      {canUpdate &&
                      record.entity_type !== "message" &&
                      !record.metadata?.domainRecord ? (
                        <>
                          <button
                            onClick={() => editRecord(record)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Bewerken"
                            title="Bewerken"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => duplicateRecord(record)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Kopiëren"
                            title="Kopiëren"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </>
                      ) : null}
                      {canUpdate && record.entity_type === "user_management" ? (
                        <>
                          <button
                            onClick={() => updateRecordStatus(record, "actief")}
                            className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
                          >
                            Activeren
                          </button>
                          <button
                            onClick={() => updateRecordStatus(record, "geblokkeerd")}
                            className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
                          >
                            Blokkeren
                          </button>
                          <button
                            onClick={() =>
                              updateRecordStatus(record, "wachtwoordherstel_verstuurd")
                            }
                            className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
                          >
                            Wachtwoord herstellen
                          </button>
                        </>
                      ) : null}
                      {canUpdate && record.entity_type === "data_import" ? (
                        <button
                          onClick={() => updateRecordStatus(record, "gecontroleerd")}
                          className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
                        >
                          Controleren
                        </button>
                      ) : null}
                      {canUpdate && record.entity_type === "consent" ? (
                        <>
                          <button
                            onClick={() => updateRecordStatus(record, "toestemming_verleend")}
                            className="rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground"
                          >
                            Toestemming geven
                          </button>
                          <button
                            onClick={() => updateRecordStatus(record, "toestemming_geweigerd")}
                            className="rounded-lg border border-destructive/30 px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                          >
                            Weigeren
                          </button>
                        </>
                      ) : null}
                      {canApprove &&
                      record.status !== "goedgekeurd" &&
                      !record.metadata?.domainRecord ? (
                        <button
                          onClick={() => updateRecordStatus(record, "goedgekeurd")}
                          className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
                        >
                          Goedkeuren
                        </button>
                      ) : null}
                      {canApprove &&
                      ["absence", "activity", "substitution"].includes(record.entity_type) &&
                      record.status !== "afgewezen" ? (
                        <button
                          onClick={() => updateRecordStatus(record, "afgewezen")}
                          className="rounded-lg border border-destructive/30 px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                        >
                          Afwijzen
                        </button>
                      ) : null}
                      {canPublish &&
                      record.status !== "gepubliceerd" &&
                      !record.metadata?.domainRecord ? (
                        <button
                          onClick={() => updateRecordStatus(record, "gepubliceerd")}
                          className="rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground"
                        >
                          Publiceren
                        </button>
                      ) : null}
                      {canCancel &&
                      record.status !== "geannuleerd" &&
                      !record.metadata?.domainRecord ? (
                        <button
                          onClick={() => updateRecordStatus(record, "geannuleerd")}
                          className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
                        >
                          Annuleren
                        </button>
                      ) : null}
                      {canDelete &&
                      record.entity_type !== "message" &&
                      !record.metadata?.domainRecord ? (
                        <button
                          onClick={() => void deleteRecord(record.id)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Verwijderen"
                          title="Verwijderen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

type RequestType = "change_role" | "new_role" | "change_rank" | "remove_access" | "advice";

type RequestRole = {
  id: string;
  name: string;
  description: string | null;
  rank: number;
  color: string;
};

type PermissionRequestSummary = {
  id: string;
  title: string;
  status: string;
  summary: string;
  platform_response: string | null;
  urgency: "normal" | "urgent";
  created_at: string;
};

const requestTypes: Array<{ value: RequestType; label: string; help: string }> = [
  {
    value: "change_role",
    label: "Bestaande rol aanpassen",
    help: "Iemand iets extra laten bekijken, aanpassen of goedkeuren.",
  },
  {
    value: "new_role",
    label: "Nieuwe rol aanvragen",
    help: "Bijvoorbeeld zorgcoördinator, stagiair of afdelingsleider.",
  },
  {
    value: "change_rank",
    label: "Rangorde aanpassen",
    help: "Veranderen wie onder welke functie valt.",
  },
  {
    value: "remove_access",
    label: "Toegang beperken",
    help: "Een bestaand recht veilig laten verwijderen.",
  },
  {
    value: "advice",
    label: "Ik weet het nog niet",
    help: "Beschrijf de situatie; platformbeheer denkt mee.",
  },
];

const plainPermissionOptions = [
  [
    "students.view",
    "Leerlinggegevens bekijken",
    "Bepaalde of alle leerlingdossiers kunnen inzien.",
  ],
  ["grades.view", "Cijfers bekijken", "Cijfers bekijken binnen het gewenste bereik."],
  ["grades.create", "Cijfers invoeren", "Nieuwe cijfers voor leerlingen kunnen invoeren."],
  ["grades.publish", "Cijfers publiceren", "Ingevoerde cijfers definitief zichtbaar maken."],
  ["attendance.update", "Aanwezigheid registreren", "Aanwezigheid en afwezigheid bijwerken."],
  ["absences.approve", "Absenties goedkeuren", "Ziekmeldingen en absenties beoordelen."],
  [
    "messages.create",
    "Berichten versturen",
    "Veilig berichten naar leerlingen, ouders of medewerkers sturen.",
  ],
  ["announcements.publish", "Schoolbrede mededelingen", "Berichten voor grote groepen publiceren."],
  [
    "documents.export",
    "Documenten exporteren",
    "Bestanden buiten Schoolpulse downloaden of exporteren.",
  ],
  ["reports.export", "Rapportages exporteren", "School- of afdelingsrapportages exporteren."],
  ["staff.view", "Personeel bekijken", "Personeelsinformatie binnen team of school zien."],
  ["user_management.manage", "Accounts beheren", "Accounts aanmaken, aanpassen en deactiveren."],
] as const;

const requestStatusLabels: Record<string, string> = {
  submitted: "Ingediend",
  in_review: "In behandeling",
  needs_information: "Meer informatie nodig",
  approved: "Goedgekeurd",
  partially_approved: "Gedeeltelijk goedgekeurd",
  rejected: "Afgewezen",
  scheduled: "Ingepland",
  completed: "Uitgevoerd",
  cancelled: "Geannuleerd",
};

function PermissionRequestWizard({
  profile,
  supabase,
}: {
  profile: ProductionProfile;
  supabase: SupabaseClient;
}) {
  const [step, setStep] = useState(1);
  const [requestType, setRequestType] = useState<RequestType>("change_role");
  const [roles, setRoles] = useState<RequestRole[]>([]);
  const [requests, setRequests] = useState<PermissionRequestSummary[]>([]);
  const [targetRoleId, setTargetRoleId] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedChanges, setSelectedChanges] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [reason, setReason] = useState("");
  const [affectedPeople, setAffectedPeople] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!profile.school_id) return;
    const [rolesResult, requestsResult] = await Promise.all([
      supabase
        .from("school_roles")
        .select("id,name,description,rank,color")
        .eq("school_id", profile.school_id)
        .eq("is_active", true)
        .order("rank", { ascending: false }),
      supabase
        .from("permission_change_requests")
        .select("id,title,status,summary,platform_response,urgency,created_at")
        .eq("school_id", profile.school_id)
        .order("created_at", { ascending: false }),
    ]);
    if (!rolesResult.error) setRoles((rolesResult.data ?? []) as RequestRole[]);
    if (!requestsResult.error)
      setRequests((requestsResult.data ?? []) as PermissionRequestSummary[]);
  }, [profile.school_id, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedRole = roles.find((role) => role.id === targetRoleId);
  const requestTypeInfo = requestTypes.find((type) => type.value === requestType)!;
  const canContinue =
    step === 1 ||
    (step === 2 &&
      (requestType === "new_role"
        ? newRoleName.trim().length >= 2
        : requestType === "advice" || Boolean(targetRoleId))) ||
    (step === 3 &&
      (selectedChanges.length > 0 || requestType === "change_rank" || requestType === "advice")) ||
    (step === 4 && summary.trim().length >= 10 && reason.trim().length >= 10);

  const submit = async () => {
    if (!profile.school_id || !canContinue) return;
    setSubmitting(true);
    const title =
      requestType === "new_role"
        ? `Nieuwe rol: ${newRoleName.trim()}`
        : `${requestTypeInfo.label}${selectedRole ? ` voor ${selectedRole.name}` : ""}`;
    const { error } = await supabase.from("permission_change_requests").insert({
      school_id: profile.school_id,
      requested_by: profile.id,
      request_type: requestType,
      target_role_id: targetRoleId || null,
      title,
      summary: summary.trim(),
      business_reason: reason.trim(),
      desired_changes: {
        requested_role_name: newRoleName.trim() || null,
        permission_keys: selectedChanges,
        plain_language_selections: plainPermissionOptions
          .filter(([key]) => selectedChanges.includes(key))
          .map(([, label]) => label),
      },
      affected_people: affectedPeople.trim() || null,
      urgency,
      requested_effective_date: effectiveDate || null,
      status: "submitted",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Verzoek kon niet worden ingediend", { description: error.message });
      return;
    }
    toast.success("Verzoek veilig ingediend bij platformbeheer");
    setStep(1);
    setTargetRoleId("");
    setNewRoleName("");
    setSelectedChanges([]);
    setSummary("");
    setReason("");
    setAffectedPeople("");
    setUrgency("normal");
    setEffectiveDate("");
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5">
        <div className="flex gap-3">
          <ShieldQuestion className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
          <div>
            <h2 className="font-semibold">Wij helpen je stap voor stap</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Je verandert hier nog geen rechten. Je beschrijft wat de school nodig heeft;
              platformbeheer controleert veiligheid, privacy en gevolgen voordat iets wordt
              aangepast.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Nieuwe aanvraag</h2>
              <p className="text-xs text-muted-foreground">Stap {step} van 5</p>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((number) => (
                <span
                  key={number}
                  className={`h-2 w-8 rounded-full ${number <= step ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="p-5">
          {step === 1 ? (
            <div>
              <h3 className="text-lg font-bold">Wat wil je veranderen?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Kies wat het beste past. Je kunt later alles toelichten.
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {requestTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setRequestType(type.value)}
                    className={`rounded-xl border p-4 text-left ${requestType === type.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}
                  >
                    <div className="font-semibold">{type.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{type.help}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h3 className="text-lg font-bold">Voor welke rol?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                De rang staat erbij ter informatie. Platformbeheer controleert de uiteindelijke
                positie.
              </p>
              {requestType === "new_role" ? (
                <label className="mt-5 block">
                  <span className="mb-1 block text-sm font-semibold">
                    Gewenste naam van de nieuwe rol
                  </span>
                  <input
                    value={newRoleName}
                    onChange={(event) => setNewRoleName(event.target.value)}
                    placeholder="Bijvoorbeeld Zorgcoördinator"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              ) : requestType === "advice" ? (
                <div className="mt-5 rounded-xl bg-muted/40 p-4 text-sm">
                  Je hoeft nog geen rol te kiezen. Beschrijf in stap 4 gewoon het probleem of de
                  gewenste werkwijze.
                </div>
              ) : (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setTargetRoleId(role.id)}
                      className={`rounded-xl border p-4 text-left ${targetRoleId === role.id ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="font-semibold">{role.name}</span>
                        <span className="ml-auto text-xs font-bold text-muted-foreground">
                          rang {role.rank}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {role.description || "Schoolrol"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h3 className="text-lg font-bold">Wat moet deze rol kunnen?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Kies in gewone taal. Je aanvraag geeft nog geen directe toegang.
              </p>
              {requestType === "change_rank" || requestType === "advice" ? (
                <div className="mt-5 rounded-xl bg-muted/40 p-4 text-sm">
                  Je hoeft hier niets aan te vinken. Beschrijf de gewenste rangorde of situatie in
                  de volgende stap.
                </div>
              ) : (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {plainPermissionOptions.map(([key, label, help]) => {
                    const checked = selectedChanges.includes(key);
                    return (
                      <label
                        key={key}
                        className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${checked ? "border-primary bg-primary/5" : "border-border"}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setSelectedChanges((current) =>
                              event.target.checked
                                ? [...current, key]
                                : current.filter((value) => value !== key),
                            )
                          }
                          className="mt-1"
                        />
                        <span>
                          <span className="font-semibold">{label}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">{help}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h3 className="text-lg font-bold">Leg de situatie kort uit</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Een concreet praktijkvoorbeeld helpt ons een veilige oplossing voor te stellen.
              </p>
              <div className="mt-5 grid gap-4">
                <label>
                  <span className="mb-1 block text-sm font-semibold">
                    Wat moet er precies veranderen?
                  </span>
                  <textarea
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    rows={4}
                    placeholder="Bijvoorbeeld: mentoren moeten ziekmeldingen van hun eigen mentorklas kunnen controleren, maar geen cijfers kunnen aanpassen."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-semibold">Waarom is dit nodig?</span>
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={3}
                    placeholder="Beschrijf het huidige probleem en wat dit voor de school oplost."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-3">
                  <label>
                    <span className="mb-1 block text-xs font-semibold">
                      Voor welke medewerkers?
                    </span>
                    <input
                      value={affectedPeople}
                      onChange={(event) => setAffectedPeople(event.target.value)}
                      placeholder="Bijv. 8 mentoren"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-semibold">Gewenste ingangsdatum</span>
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(event) => setEffectiveDate(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-semibold">Urgentie</span>
                    <select
                      value={urgency}
                      onChange={(event) => setUrgency(event.target.value as "normal" | "urgent")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="normal">Normaal</option>
                      <option value="urgent">Dringend</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div>
              <h3 className="text-lg font-bold">Controleer je aanvraag</h3>
              <div className="mt-5 space-y-3 rounded-xl border border-border bg-muted/30 p-5 text-sm">
                <div>
                  <span className="font-semibold">Type:</span> {requestTypeInfo.label}
                </div>
                <div>
                  <span className="font-semibold">Rol:</span>{" "}
                  {newRoleName || selectedRole?.name || "Advies gevraagd"}
                </div>
                <div>
                  <span className="font-semibold">Gewenste mogelijkheden:</span>{" "}
                  {plainPermissionOptions
                    .filter(([key]) => selectedChanges.includes(key))
                    .map(([, label]) => label)
                    .join(", ") || "Zie toelichting"}
                </div>
                <div>
                  <span className="font-semibold">Verandering:</span> {summary}
                </div>
                <div>
                  <span className="font-semibold">Reden:</span> {reason}
                </div>
              </div>
              <div className="mt-4 flex gap-2 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                Na indienen beoordeelt platformbeheer het verzoek. Er worden nu nog geen permissies
                gewijzigd.
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-between border-t border-border p-5">
          <button
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            disabled={step === 1 || submitting}
            className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40"
          >
            Vorige
          </button>
          {step < 5 ? (
            <button
              onClick={() => setStep((current) => Math.min(5, current + 1))}
              disabled={!canContinue}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              Volgende
            </button>
          ) : (
            <button
              onClick={() => void submit()}
              disabled={submitting || !canContinue}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {submitting ? "Indienen…" : "Verzoek indienen"}
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Mijn schoolverzoeken</h2>
        <div className="mt-4 space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="min-w-0 flex-1 font-semibold">{request.title}</div>
                {request.urgency === "urgent" ? (
                  <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning">
                    DRINGEND
                  </span>
                ) : null}
                <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">
                  {requestStatusLabels[request.status] ?? request.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{request.summary}</p>
              {request.platform_response ? (
                <div className="mt-3 rounded-lg bg-primary/5 p-3 text-sm">
                  <span className="font-semibold">Reactie platformbeheer:</span>{" "}
                  {request.platform_response}
                </div>
              ) : null}
              <div className="mt-2 text-[11px] text-muted-foreground">
                Ingediend op {new Date(request.created_at).toLocaleString("nl-NL")}
              </div>
            </div>
          ))}
          {!requests.length ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nog geen verzoeken ingediend.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
