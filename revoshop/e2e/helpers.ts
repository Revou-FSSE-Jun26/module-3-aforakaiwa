import { type Page, expect } from "@playwright/test";

/** A fresh, unique customer identity for a test run (avoids "email taken"). */
export function uniqueCustomer() {
  const ts = Date.now() + Math.floor(Math.random() * 1000);
  return {
    fullName: "E2E Tester",
    username: `e2e${ts}`,
    email: `e2e_${ts}@test.com`,
    password: "Passw0rd!",
  };
}

/** Admin credentials from env (never hardcoded in committed source). */
export function adminCreds() {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin tests. See README.",
    );
  }
  return { email, password };
}

/** Register a new customer through the UI and land on the storefront home. */
export async function registerCustomer(
  page: Page,
  user = uniqueCustomer(),
): Promise<ReturnType<typeof uniqueCustomer>> {
  await page.goto("/register");
  await page.getByLabel("Full name").fill(user.fullName);
  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
  // Customer lands on the storefront home; header shows the username.
  await expect(page).toHaveURL("/", { timeout: 60_000 });
  await expect(page.getByTestId("username")).toHaveText(user.username);
  return user;
}

/** Log in through the UI with the given credentials. */
export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/** Log out via the header button. */
export async function logout(page: Page) {
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
}
