import { products } from "./data.js";
import { addButtonClasses, badgeFor, categoryStyles, filterPillClasses, stockDisplay } from "./styles.js";
// ---------- 1. Select elements (with types) ----------
const searchInput = document.querySelector("#search");
const filterBar = document.querySelector("#category-filters");
const grid = document.querySelector("#product-grid");
const resultCount = document.querySelector("#result-count");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
// formatPrice — ARROW function → returns a Rupiah STRING
const formatPrice = (price) => "Rp " + price.toLocaleString("id-ID");
// ---------- 2. State ----------
const state = {
    query: "",
    category: "all",
    cart: [],
};
// ---------- 3. Helper functions ----------
function quantityInCart(productId) {
    const item = state.cart.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
}
// Total price of everything in the cart (price x quantity, summed with reduce)
function cartTotalAmount() {
    return state.cart.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.productId);
        const price = product ? product.price.amount : 0;
        return sum + price * item.quantity;
    }, 0);
}
function maxQuantity(product) {
    return product.stock.kind === "out-of-stock" ? 0 : product.stock.quantity;
}
function matchesSearch(product, query) {
    const q = query.trim().toLowerCase();
    if (q === "")
        return true;
    const text = [product.name, product.description, ...product.tags].join(" ").toLowerCase();
    return text.includes(q);
}
function getVisibleProducts() {
    return products
        .filter((p) => state.category === "all" || p.category === state.category)
        .filter((p) => matchesSearch(p, state.query));
}
function addToCart(productId) {
    const product = products.find((p) => p.id === productId);
    if (!product)
        return;
    if (quantityInCart(productId) >= maxQuantity(product))
        return; // don't exceed stock
    const item = state.cart.find((i) => i.productId === productId);
    if (item) {
        item.quantity += 1;
    }
    else {
        state.cart.push({ productId, quantity: 1 });
    }
}
function removeFromCart(productId) {
    const item = state.cart.find((i) => i.productId === productId);
    if (!item)
        return;
    item.quantity -= 1;
    if (item.quantity <= 0) {
        state.cart = state.cart.filter((i) => i.productId !== productId);
    }
}
// ---------- 4. Render: turn one Product into HTML ----------
// Category chip + optional badge
function cardTags(product) {
    const cat = categoryStyles[product.category];
    const badge = badgeFor(product.badge);
    const badgeHtml = badge
        ? `<span class="rounded-md px-2 py-0.5 text-xs font-bold ${badge.classes}">${badge.text}</span>`
        : "";
    return `
        <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.chip}">${cat.label}</span>
        ${badgeHtml}
        </div>`;
}
// Price block (struck-through original + final price)
function cardPrice(product) {
    const original = product.price.originalAmount
        ? `<span class="text-sm text-slate-400 line-through">${formatPrice(product.price.originalAmount)}</span>`
        : "";
    return `
        <div class="flex flex-col">
        ${original}
        <span class="text-xl font-bold text-slate-900">${formatPrice(product.price.amount)}</span>
        </div>`;
}
// Cart controls (+/- stepper when in cart, otherwise an Add to cart button)
function cardControls(product) {
    const inCart = quantityInCart(product.id);
    const soldOut = product.stock.kind === "out-of-stock";
    if (inCart > 0) {
        return `
        <div class="flex items-center gap-2">
            <button data-action="remove" data-id="${product.id}" class="h-9 w-9 rounded-lg border border-slate-300 font-bold hover:bg-slate-100">−</button>
            <span class="w-6 text-center font-semibold">${inCart}</span>
            <button data-action="add" data-id="${product.id}" class="h-9 w-9 rounded-lg bg-blue-700 font-bold text-white hover:bg-blue-900">+</button>
        </div>`;
    }
    return `
        <button data-action="add" data-id="${product.id}" ${soldOut ? "disabled" : ""} class="${addButtonClasses(soldOut)}">
        ${soldOut ? "Sold out" : "Add to cart"}
        </button>`;
}
// Main card: assembles the small pieces above into one <li>
function productCard(product) {
    const cat = categoryStyles[product.category];
    const stock = stockDisplay(product.stock);
    return `
        <li class="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="h-2 ${cat.tile}"></div>
        <div class="flex flex-1 flex-col gap-2 p-4">
            ${cardTags(product)}
            <h3 class="text-lg font-bold text-slate-900">${product.name}</h3>
            <p class="text-sm leading-relaxed text-slate-600">${product.description}</p>
            <p class="flex items-center gap-2 text-xs ${stock.classes}">
            <span class="h-2 w-2 rounded-full ${stock.dot}"></span>${stock.text}
            </p>
            <div class="mt-auto flex items-end justify-between gap-3 pt-3">
            ${cardPrice(product)}
            ${cardControls(product)}
            </div>
        </div>
        </li>`;
}
function renderFilters() {
    const options = ["all", ...Object.keys(categoryStyles)];
    filterBar.innerHTML = options
        .map((c) => {
        const label = c === "all" ? "All" : categoryStyles[c].label;
        return `<button type="button" data-category="${c}" class="${filterPillClasses(state.category === c)}">${label}</button>`;
    })
        .join("");
}
function render() {
    const visible = getVisibleProducts();
    grid.innerHTML =
        visible.length > 0
            ? visible.map(productCard).join("")
            : `<li class="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
            No products match your search. Try another word.
            </li>`;
    resultCount.textContent = `Showing ${visible.length} of ${products.length} products`;
    cartCount.textContent = String(state.cart.reduce((sum, item) => sum + item.quantity, 0));
    cartTotal.textContent = formatPrice(cartTotalAmount());
    renderFilters();
}
// ---------- 5. Events ----------
searchInput.addEventListener("input", () => {
    state.query = searchInput.value;
    render();
});
filterBar.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button)
        return;
    state.category = button.dataset.category;
    render();
});
grid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || button.disabled)
        return;
    const id = Number(button.dataset.id);
    if (button.dataset.action === "add")
        addToCart(id);
    if (button.dataset.action === "remove")
        removeFromCart(id);
    render();
});
render();
//# sourceMappingURL=main.js.map