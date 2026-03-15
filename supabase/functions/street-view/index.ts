import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { address } = await req.json();
    if (!address) {
      return new Response(JSON.stringify({ error: "Address required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "Google Maps API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Geocode the address
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results?.length) {
      return new Response(JSON.stringify({ error: "Address not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const loc = geoData.results[0].geometry.location;

    // 2) Check Street View availability
    const metaUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${loc.lat},${loc.lng}&key=${API_KEY}`;
    const metaRes = await fetch(metaUrl);
    const metaData = await metaRes.json();

    if (metaData.status !== "OK") {
      return new Response(JSON.stringify({ error: "Street View not available for this location", formatted_address: geoData.results[0].formatted_address }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Get Street View image
    const svUrl = `https://maps.googleapis.com/maps/api/streetview?size=1200x800&location=${loc.lat},${loc.lng}&fov=90&key=${API_KEY}`;
    const svRes = await fetch(svUrl);
    
    if (!svRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch Street View image" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageBlob = await svRes.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBlob)));

    return new Response(JSON.stringify({
      image: `data:image/jpeg;base64,${base64}`,
      formatted_address: geoData.results[0].formatted_address,
      lat: loc.lat,
      lng: loc.lng,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("street-view error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
