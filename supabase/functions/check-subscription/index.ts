import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${d}`);
};

// Maps Stripe product IDs to internal plan tier names
const PRODUCT_TIER_MAP: Record<string, string> = {
  prod_U9hozSkF9RARqP: "start",
  prod_U9hr9FrtnMbBLA: "pro",
  prod_U9hrSFRwDkF3Vx: "elite",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { email: user.email });

    // Get user's company
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.company_id) {
      return new Response(JSON.stringify({ subscribed: false, tier: "start", subscription_status: "none" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false, tier: "start", subscription_status: "none" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check active or past_due subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
    });

    let tier = "start";
    let subscriptionStatus = "none";
    let subscriptionEnd: string | null = null;
    let subscribed = false;

    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0];
      subscriptionStatus = sub.status; // active, past_due, canceled, etc.
      subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      const productId = sub.items.data[0]?.price?.product as string;
      tier = PRODUCT_TIER_MAP[productId] || "start";
      subscribed = sub.status === "active" || sub.status === "past_due";
      logStep("Subscription found", { status: sub.status, tier, productId });
    }

    // Sync to companies table
    await supabaseAdmin
      .from("companies")
      .update({
        plan_id: tier,
        subscription_status: subscriptionStatus,
        stripe_customer_id: customerId,
        subscription_end_date: subscriptionEnd,
      })
      .eq("id", profile.company_id);

    logStep("Company updated", { companyId: profile.company_id, tier, subscriptionStatus });

    return new Response(
      JSON.stringify({
        subscribed,
        tier,
        subscription_status: subscriptionStatus,
        subscription_end: subscriptionEnd,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
