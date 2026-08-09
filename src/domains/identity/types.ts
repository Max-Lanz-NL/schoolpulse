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

export type AssignedRole = {
  id: string;
  name: string;
  rank: number;
  color: string;
  is_primary: boolean;
};

export type ProfilePreferences = {
  profile_id: string;
  school_id: string | null;
  display_name: string | null;
  notification_email: boolean;
  notification_in_app: boolean;
  notification_digest: string;
};

export type IdentityContext = {
  userId: string;
  profile: ProductionProfile;
  schoolId: string | null;
  roles: AssignedRole[];
  primaryRole: AssignedRole | null;
  permissions: EffectivePermission[];
  rank: number;
  preferences: ProfilePreferences | null;
};
