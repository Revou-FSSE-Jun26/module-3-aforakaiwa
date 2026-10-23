import { test, expect } from "@playwright/test";
import { adminCreds, login } from "./helpers";

// A unique product name/SKU per run so the create/edit/delete cycle is
// self-cleaning and never collides with existing data.
function uniqueProduct() {
  const n = Date.now() % 100000000;
  return {
    name: `E2E Product ${n}`,
    editedName: `E2E Product ${n} (edited)`,
    sku: `E2E${n}`.slice(0, 11),
    price: "12345",
    stock: "7",
  };
}

test.describe("Admin dashboard CRUD", () => {
  test("admin can create, edit, and delete a product", async ({ page }) => {
    const admin = adminCreds();
    const product = uniqueProduct();

    // Login as admin -> redirected to the dashboard.
    await login(page, admin.email, admin.password);
    await expect(page).toHaveURL("/dashboard", { timeout: 60_000 });

    // Wait for the product table to finish its initial load.
    await expect(page.getByTestId("product-table-body")).toBeVisible({
      timeout: 60_000,
    });

    // CREATE: fill the create form and submit.
    await page.getByLabel("Name").fill(product.name);
    await page.getByLabel("SKU").fill(product.sku);
    await page.getByLabel("Price").fill(product.price);
    await page.getByLabel("Stock").fill(product.stock);
    await page.getByTestId("create-product-submit").click();

    // The new product appears in the table.
    const row = page.getByTestId("product-table-body").locator("tr", {
      hasText: product.name,
    });
    await expect(row).toBeVisible({ timeout: 60_000 });

    // EDIT: open the inline edit form for that row and rename it.
    await row.getByRole("button", { name: "Edit" }).click();
    const nameInput = page.getByLabel("Name");
    await nameInput.fill(product.editedName);
    await page.getByTestId("edit-product-submit").click();
    const editedRow = page.getByTestId("product-table-body").locator("tr", {
      hasText: product.editedName,
    });
    await expect(editedRow).toBeVisible({ timeout: 60_000 });

    // DELETE: accept the confirm dialog, then the row disappears.
    page.once("dialog", (dialog) => dialog.accept());
    await editedRow.getByRole("button", { name: "Delete" }).click();
    await expect(
      page.getByTestId("product-table-body").locator("tr", {
        hasText: product.editedName,
      }),
    ).toHaveCount(0, { timeout: 60_000 });
  });

  test("admin can create a category", async ({ page }) => {
    const admin = adminCreds();
    const name = `E2E Cat ${Date.now() % 100000000}`;

    await login(page, admin.email, admin.password);
    await expect(page).toHaveURL("/dashboard", { timeout: 60_000 });

    // Navigate to the Categories tab.
    await page.goto("/dashboard/categories");
    await expect(page.getByTestId("category-table-body")).toBeVisible({
      timeout: 60_000,
    });

    // Create a category.
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Description").fill("Created by E2E");
    await page.getByTestId("create-category-submit").click();

    await expect(
      page.getByTestId("category-table-body").locator("tr", { hasText: name }),
    ).toBeVisible({ timeout: 60_000 });
  });
});
