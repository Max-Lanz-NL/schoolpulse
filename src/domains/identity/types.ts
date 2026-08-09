export type ProductionRole = "platform_admin" | "school_admin" | "teacher" | "student" | "parent";

export type ProductionProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: ProductionRole;
  school_name: string | null;
  school_id: string | null;
};

export type PermissionScope = "own" | "assigned" | "team" | "school";

export type EffectivePermission = {
  permission_key: string;
  scope: PermissionScope;
  source_roles: string[];
};
