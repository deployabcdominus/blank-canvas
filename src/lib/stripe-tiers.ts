// Stripe product and price mappings for SignFlow plans
export const STRIPE_TIERS = {
  start: {
    product_id: "prod_U9hozSkF9RARqP",
    price_id: "price_1TBOP4Cks3E8U9wUSbUjFVdj",
    name: "Start",
    price: "$29",
  },
  pro: {
    product_id: "prod_U9hr9FrtnMbBLA",
    price_id: "price_1TBORMCks3E8U9wUkbC3Q3T2",
    name: "Pro",
    price: "$79",
  },
  elite: {
    product_id: "prod_U9hrSFRwDkF3Vx",
    price_id: "price_1TBOS2Cks3E8U9wUN2RD2my4",
    name: "Elite",
    price: "$149",
  },
} as const;

export type StripeTier = keyof typeof STRIPE_TIERS;
