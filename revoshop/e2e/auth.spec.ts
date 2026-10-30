import { test, expect } from "@playwright/test";
import { uniqueCustomer, registerCustomer, login, logout } from "./helpers";

test.describe("Authentication", () => {
  test("register logs the user in and redirects, then logout, then login again", async ({
    page,
  }) => {
    const user = uniqueCustomer();

    // Register -> auto-login -> redirected to home, username in header.
    await registerCustomer(page, user);

    // Logout returns to a logged-out header (Login link visible).
    await logout(page);

    // Log back in with the same credentials -> customer lands on home.
    await login(page, user.email, user.password);
    await expect(page).toHaveURL("/", { timeout: 60_000 });
    await expect(page.getByTestId("username")).toHaveText(user.username);
  });

  test("shows an error on invalid credentials", async ({ page }) => {
    await login(page, "definitely-not-real@test.com", "wrongpassword");
    // Stays on /login and surfaces an inline error.
    await expect(page).toHaveURL(/\/login$/);
    // Scope to the alert that actually carries text: getByRole("alert") also
    // matches Next.js's empty route announcer (<div id="__next-route-announcer__">),
    // which trips Playwright's strict mode. Filtering by text targets the real one.
    await expect(
      page.getByRole("alert").filter({ hasText: /invalid/i }),
    ).toBeVisible();
  });

  test("register validates required fields", async ({ page }) => {
    await page.goto("/register");
    // Submit empty -> inline validation errors, no navigation.
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText("Full name is required.")).toBeVisible();
    await expect(page.getByText("Email is required.")).toBeVisible();
    await expect(page.getByText("Password is required.")).toBeVisible();
  });
});
