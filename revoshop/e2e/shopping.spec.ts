import { test, expect } from "@playwright/test";
import { registerCustomer } from "./helpers";

test.describe("Shopping journey", () => {
  test("browse products -> add to cart -> checkout -> orders", async ({
    page,
  }) => {
    // A fresh customer so the cart and orders start clean.
    await registerCustomer(page);

    // Browse the product list.
    await page.goto("/products");
    // Open the first product's detail page via its title link.
    const firstProduct = page
      .locator("article a[href^='/products/']")
      .first();
    await expect(firstProduct).toBeVisible({ timeout: 60_000 });
    await firstProduct.click();
    await expect(page).toHaveURL(/\/products\/\d+$/);

    // Add to cart from the detail page.
    await page.getByTestId("add-to-cart").click();

    // Go to the cart via the header Cart link (appears when signed in).
    await page.getByTestId("nav-cart").click();
    await expect(page).toHaveURL("/cart");

    // Cart has at least one row and a non-empty total; checkout is enabled.
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.getByTestId("cart-total")).toBeVisible();
    const checkout = page.getByTestId("checkout-link");
    await expect(checkout).toBeVisible();
    await checkout.click();
    await expect(page).toHaveURL("/checkout");

    // Fill shipping address and confirm the order.
    await page.getByLabel("Shipping address").fill("Jl. E2E No. 1, Jakarta");
    await page.getByTestId("confirm-order").click();

    // Redirected to orders; the order we just placed is listed.
    await expect(page).toHaveURL("/orders", { timeout: 60_000 });
    await expect(page.getByTestId("order-row").first()).toBeVisible({
      timeout: 60_000,
    });
  });

  test("checkout button is disabled when the cart is empty", async ({
    page,
  }) => {
    await registerCustomer(page);
    await page.goto("/cart");
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
    // The empty-cart checkout is a disabled button (not a link).
    const disabledBtn = page.getByRole("button", { name: "Proceed to Checkout" });
    await expect(disabledBtn).toBeDisabled();
    await expect(page.getByTestId("checkout-link")).toHaveCount(0);
  });
});
