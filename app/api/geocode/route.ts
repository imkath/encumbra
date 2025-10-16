import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing lat or lon parameters" },
      { status: 400 }
    );
  }

  try {
    // Llamar a Nominatim desde el servidor (sin CSP issues)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Encumbra-App/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();

    // Extraer la comuna/barrio
    const address = data.address || {};
    const comuna =
      address.suburb ||
      address.neighbourhood ||
      address.municipality ||
      address.city_district ||
      address.town ||
      address.city ||
      "Tu ubicación";

    return NextResponse.json({
      locationName: comuna,
      fullAddress: data.display_name,
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { locationName: "Tu ubicación" },
      { status: 200 } // Devolver 200 con fallback
    );
  }
}
