// Decides what a typed code is worth: the admin-set % on the products that own the code. Server-only.
import { percentByProductForCode } from "./discountStore";
import { productCodeDiscount, type DiscountResult } from "./discount";
export const resolveDiscount = async (code: string, items: { productId: string; lineCents: number }[]): Promise<DiscountResult> => productCodeDiscount(items, await percentByProductForCode(code));
