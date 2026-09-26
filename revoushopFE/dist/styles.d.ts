import type { Badge, Category, StockStatus } from "./types.js";
export declare const categoryStyles: Record<Category, {
    label: string;
    chip: string;
    tile: string;
}>;
export declare function badgeFor(badge: Badge): {
    text: string;
    classes: string;
} | null;
export declare function stockDisplay(stock: StockStatus): {
    text: string;
    classes: string;
    dot: string;
};
export declare function addButtonClasses(disabled: boolean): string;
export declare function filterPillClasses(active: boolean): string;
//# sourceMappingURL=styles.d.ts.map