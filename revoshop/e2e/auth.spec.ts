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
    await expect(
      page.getByText("Please confirm your password."),
    ).toBeVisible();
  });

  test("register rejects a password shorter than 8 characters", async ({
    page,
  }) => {
    const user = uniqueCustomer();
    await page.goto("/register");
    await page.getByLabel("Full name").fill(user.fullName);
    await page.getByLabel("Username").fill(user.username);
    await page.getByLabel("Email").fill(user.email);
    // 7 chars: one short of the backend's minimum of 8.
    await page.getByLabel("Password", { exact: true }).fill("Short1!");
    await page.getByLabel("Confirm password").fill("Short1!");
    await page.getByRole("button", { name: "Create account" }).click();
    // Client-side validation blocks the request; stays on /register.
    await expect(page).toHaveURL(/\/register$/);
    await expect(
      page.getByText("Password must be at least 8 characters."),
    ).toBeVisible();
  });

  test("register rejects mismatched confirm password", async ({ page }) => {
    const user = uniqueCustomer();
    await page.goto("/register");
    await page.getByLabel("Full name").fill(user.fullName);
    await page.getByLabel("Username").fill(user.username);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill(user.password);
    await page.getByLabel("Confirm password").fill(`${user.password}x`);
    await page.getByRole("button", { name: "Create account" }).click();
    // Mismatch blocks submission; stays on /register with an inline error.
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText("Passwords do not match.")).toBeVisible();
  });
});
