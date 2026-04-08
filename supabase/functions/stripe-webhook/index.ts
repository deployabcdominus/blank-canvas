import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${d}`);
};

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

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeKey || !webhookSecret) {
    logStep("ERROR - Missing secrets");
    return new Response("Missing secrets", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    logStep("ERROR - No stripe-signature header");
    return new Response("No signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    logStep("Event received", { type: event.type, id: event.id });
  } catch (err) {
    logStep("ERROR - Invalid signature", { err });
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const customerEmail = session.customer_details?.email;
        logStep("checkout.session.completed", { customerId, customerEmail });
        if (!customerEmail) break;
        const subscriptions = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
        if (subscriptions.data.length === 0) break;
        const sub = subscriptions.data[0];
        const productId = sub.items.data[0]?.price?.product as string;
        const tier = PRODUCT_TIER_MAP[productId] || "start";
        const subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
        await updateCompanyByEmail(supabaseAdmin, customerEmail, {
          plan_id: tier,
          subscription_status: "active",
          stripe_customer_id: customerId,
          subscription_end_date: subscriptionEnd,
        });
        logStep("Plan activated", { email: customerEmail, tier });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        logStep("invoice.paid", { customerId });
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const email = customer.email;
        if (!email) break;
        const subscriptions = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
        if (subscriptions.data.length === 0) break;
        const sub = subscriptions.data[0];
        const productId = sub.items.data[0]?.price?.product as string;
        const tier = PRODUCT_TIER_MAP[productId] || "start";
        const subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
        await updateCompanyByEmail(supabaseAdmin, email, {
          plan_id: tier,
          subscription_status: "active",
          stripe_customer_id: customerId,
          subscription_end_date: subscriptionEnd,
        });
        logStep("Subscription renewed", { email, tier, subscriptionEnd });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        logStep("invoice.payment_failed", { customerId });
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const email = customer.email;
        if (!email) break;
        await updateCompanyByEmail(supabaseAdmin, email, {
          subscription_status: "past_due",
        });
        logStep("Subscription marked past_due", { email });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        logStep("customer.subscription.deleted", { customerId });
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const email = customer.email;
        if (!email) break;
        await updateCompanyByEmail(supabaseAdmin, email, {
          subscription_status: "canceled",
          plan_id: "start",
          subscription_end_date: new Date().toISOString(),
        });
        logStep("Subscription canceled", { email });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR processing event", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function updateCompanyByEmail(
  supabase: ReturnType<typeof createClient>,
  email: string,
  updates: Record<string, unknown>
) {
  const { data: user } = await supabase.auth.admin.listUsers();
  const matchedUser = user?.users?.find(u => u.email === email);
  if (!matchedUser) {
    console.log(`[STRIPE-WEBHOOK] No user found for email: ${email}`);
    return;
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", matchedUser.id)
    .maybeSingle();
  if (!profile?.company_id) {
    console.log(`[STRIPE-WEBHOOK] No company found for user: ${email}`);
    return;
  }
  const { data: company } = await supabase
    .from("companies")
    .select("billing_type")
    .eq("id", profile.company_id)
    .maybeSingle();
  if (company?.billing_type === "manual_admin") {
    console.log(`[STRIPE-WEBHOOK] Skipping — manual_admin billing`);
    return;
  }
  await supabase
    .from("companies")
    .update(updates)
    .eq("id", profile.company_id);
}
