# Identity contract

- **Purpose:** authentication, profiles, roles, permissions and tenant identity.
- **Sources:** Supabase Auth, `profiles`, `school_roles`, `role_permissions`, `profile_role_assignments`, permission workflow tables.
- **Roles:** every signed-in role; platform administration follows its existing separate rules.
- **Reads:** own session/profile and effective access; managers read accounts allowed by RLS.
- **Writes:** own preferences; authorised role/account administration only.
- **Dependencies:** School for `school_id`.
- **Outside 1.0:** Entra ID, Microsoft SSO and automated provisioning.
