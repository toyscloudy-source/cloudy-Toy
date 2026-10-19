// DEMO DATA ONLY. Replace with Supabase queries (see supabase/migrations). Not live records.
export type Product = { id:string; slug:string; name:string; sku:string; price:number; salePrice?:number; stock:number; category:string; description:string; images:{src:string;alt:string}[]; active?:boolean; createdAt?:string };
export const DEMO_PRODUCTS: Product[] = [
 {id:"1",slug:"cloud-plush-bear",name:"Cloud Plush Bear",sku:"CT-TOY-001",price:18,salePrice:15,stock:12,category:"Plush",description:"Soft plush bear. Demo item.",images:[]},
 {id:"2",slug:"wooden-stacking-rings",name:"Wooden Stacking Rings",sku:"CT-TOY-002",price:12,stock:30,category:"Wooden",description:"Colourful stacking rings. Demo item.",images:[]},
 {id:"3",slug:"mini-building-blocks",name:"Mini Building Blocks (100 pcs)",sku:"CT-TOY-003",price:25,stock:0,category:"Building",description:"Creative blocks set. Demo item.",images:[]},
 {id:"4",slug:"sky-explorer-puzzle",name:"Sky Explorer Puzzle",sku:"CT-TOY-004",price:14,stock:8,category:"Puzzles",description:"48-piece puzzle. Demo item.",images:[]},
];
export const CATEGORIES = ["Plush","Wooden","Building","Puzzles"]; // default list; the live list is derived from products
export const FALLBACK_IMG = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='#EAF5FF'/><path d='M110 190a40 40 0 0 1 12-78 55 55 0 0 1 106-8 45 45 0 0 1 58 86z' fill='#8ECCFF'/></svg>");
export const money = (n:number)=>`$${n.toFixed(2)}`;
/** A product counts as "New" for 14 days after the admin adds it. */
export const NEW_DAYS = 14;
export const isNewProduct = (createdAt?: string, now = Date.now()) => !!createdAt && now - new Date(createdAt).getTime() < NEW_DAYS * 86400000;
