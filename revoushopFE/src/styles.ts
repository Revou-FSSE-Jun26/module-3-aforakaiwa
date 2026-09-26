import type { Badge, Category, StockStatus } from "./types.js";

export const categoryStyles: Record<Category, { label: string; chip: string; tile: string }> = {
    electronics   : { label: "Electronics",   chip: "bg-sky-100 text-sky-800",            tile: "bg-sky-400" },
    clothing      : { label: "Clothing",      chip: "bg-rose-100 text-rose-800",          tile: "bg-rose-400" },
    home          : { label: "Home",          chip: "bg-emerald-100 text-emerald-800",    tile: "bg-emerald-400" },
    books         : { label: "Books",         chip: "bg-violet-100 text-violet-800",      tile: "bg-violet-400" },
};

const badgeStyles: Record<NonNullable<Badge>, { text: string; classes: string }> = {
    new         : { text: "New",            classes: "bg-blue-700 text-white" },
    sale        : { text: "Sale",           classes: "bg-amber-400 text-slate-900" },
    bestseller  : { text: "Best seller",    classes: "bg-slate-900 text-white" },
};

export function badgeFor(badge: Badge) {
    return badge === null ? null : badgeStyles[badge];
}

export function stockDisplay(stock: StockStatus): { text: string; classes: string; dot: string } {
    switch (stock.kind) {
        case "in-stock":
        return { text: `In stock (${stock.quantity})`, classes: "text-emerald-700", dot: "bg-emerald-500" };
        case "low-stock":
        return { text: `Only ${stock.quantity} left`, classes: "text-amber-700 font-semibold", dot: "bg-amber-500" };
        case "out-of-stock":
        return {
            text: stock.restockDate ? `Sold out, back ${stock.restockDate}` : "Sold out",
            classes: "text-slate-500",
            dot: "bg-slate-400",
        };
    }
}

export function addButtonClasses(disabled: boolean): string {
    const base = "rounded-lg px-4 py-2 text-sm font-semibold";
    return disabled
        ? `${base} cursor-not-allowed bg-slate-200 text-slate-500`
        : `${base} bg-blue-700 text-white hover:bg-blue-900`;
}

export function filterPillClasses(active: boolean): string {
    const base = "rounded-full border px-4 py-1.5 text-sm font-medium";
    return active
        ? `${base} border-blue-700 bg-blue-700 text-white`
        : `${base} border-slate-300 bg-white text-slate-700 hover:border-blue-700`;
}