export type RecoveryRole = "platform_admin" | "school_admin" | "teacher" | "student" | "parent";

export type RecoveryActor = {
  id: string;
  role: RecoveryRole;
  school_id: string | null;
  aal: string;
};
export type RecoveryTarget = { id: string; role: RecoveryRole; school_id: string | null };

export function canRecoverMfa(actor: RecoveryActor, target: RecoveryTarget): boolean {
  if (actor.aal !== "aal2" || actor.id === target.id) return false;
  if (target.role === "platform_admin") return actor.role === "platform_admin";
  if (target.role !== "school_admin") return false;
  if (actor.role === "platform_admin") return true;
  return (
    actor.role === "school_admin" &&
    actor.school_id !== null &&
    actor.school_id === target.school_id
  );
}
