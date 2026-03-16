import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[RETRIEVE-SESSION] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId is required");
    logStep("Session ID received", { sessionId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product", "subscription"],
    });

    logStep("Session retrieved", { status: session.status, email: session.customer_email });

    if (session.status !== "complete") {
      throw new Error("Payment not completed");
    }

    const email = session.customer_email || session.customer_details?.email || null;
    
    // Get plan info from line items
    let planName = "Start";
    let priceId = "";
    
    if (session.line_items?.data?.length) {
      const item = session.line_items.data[0];
      priceId = item.price?.id || "";
      const product = item.price?.product;
      if (typeof product === "object" && product !== null && "name" in product) {
        planName = (product as { name: string }).name;
      }
    }

    logStep("Returning session data", { email, planName, priceId });

    return new Response(
      JSON.stringify({
        email,
        planName,
        priceId,
        customerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
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
