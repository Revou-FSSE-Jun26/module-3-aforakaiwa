// Small auth helpers shared across login, register, and route guards.

import type { UserRole } from "@/types";

/**
 * Where to send a user right after they authenticate, based on their role:
 *   - Admin    -> /dashboard (the admin control panel)
 *   - Customer -> /          (the storefront home)
 * Kept in one place so login and register stay consistent.
 */
export function destinationForRole(role: UserRole): string {
  return role === "Admin" ? "/dashboard" : "/";
}
