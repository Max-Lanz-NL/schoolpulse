import assert from "node:assert/strict";
import test from "node:test";

import { canRecoverMfa } from "../supabase/functions/_shared/mfa-recovery-policy.ts";

const platform = { id: "p1", role: "platform_admin", school_id: null, aal: "aal2" };
const schoolA = { id: "a1", role: "school_admin", school_id: "school-a", aal: "aal2" };
const targetPlatform = { id: "p2", role: "platform_admin", school_id: null };
const targetSchoolA = { id: "a2", role: "school_admin", school_id: "school-a" };
const targetSchoolB = { id: "b2", role: "school_admin", school_id: "school-b" };

test("second AAL2 platform admin can recover platform admin", () =>
  assert.equal(canRecoverMfa(platform, targetPlatform), true));
test("AAL1 actor is denied", () =>
  assert.equal(canRecoverMfa({ ...platform, aal: "aal1" }, targetPlatform), false));
test("self recovery is denied", () =>
  assert.equal(canRecoverMfa(platform, { ...targetPlatform, id: platform.id }), false));
test("same-school second school admin can recover school admin", () =>
  assert.equal(canRecoverMfa(schoolA, targetSchoolA), true));
test("cross-school recovery is denied", () =>
  assert.equal(canRecoverMfa(schoolA, targetSchoolB), false));
test("school admin cannot recover platform admin", () =>
  assert.equal(canRecoverMfa(schoolA, targetPlatform), false));
test("teacher and student roles cannot recover administrators", () => {
  assert.equal(
    canRecoverMfa({ id: "t", role: "teacher", school_id: "school-a", aal: "aal2" }, targetSchoolA),
    false,
  );
  assert.equal(
    canRecoverMfa({ id: "s", role: "student", school_id: "school-a", aal: "aal2" }, targetSchoolA),
    false,
  );
});
