import { NextResponse } from "next/server"

type Stop = { id: string; name: string; city: string }
type RouteRow = {
  id: string
  route_code: string | null
  route_name: string
  transport_mode: "bus" | "train" | "metro" | "cab" | "auto" | string
  estimated_duration_minutes: number | null
  distance_km: number | string | null
  origin_stop_id: string | null
  destination_stop_id: string | null
}
type FareRule = {
  route_id: string | null
  transport_mode: string
  base_fare: number | string
  per_km_fare: number | string
  minimum_fare: number | string
  booking_fee: number | string
}

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

async function supabaseGet<T>(tableAndQuery: string): Promise<T> {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env.local.")

  const headers: Record<string, string> = { apikey: key, Accept: "application/json" }
  // Legacy anon keys are JWTs; newer publishable keys are not, so don't send them as Bearer tokens.
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`

  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${tableAndQuery}`, {
    headers,
    cache: "no-store",
  })
  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Supabase request failed (${response.status}): ${details.slice(0, 250)}`)
  }
  return response.json() as Promise<T>
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const from = (searchParams.get("from") || "").trim().toLowerCase()
    const to = (searchParams.get("to") || "").trim().toLowerCase()

    const [routes, stops, fares] = await Promise.all([
      supabaseGet<RouteRow[]>("routes?select=id,route_code,route_name,transport_mode,estimated_duration_minutes,distance_km,origin_stop_id,destination_stop_id,active&active=eq.true&order=route_name.asc"),
      supabaseGet<Stop[]>("stops?select=id,name,city&active=eq.true"),
      supabaseGet<FareRule[]>("fare_rules?select=route_id,transport_mode,base_fare,per_km_fare,minimum_fare,booking_fee&active=eq.true"),
    ])

    const stopById = new Map(stops.map((stop) => [stop.id, stop]))
    const matchingRoutes = routes.filter((route) => {
      const origin = stopById.get(route.origin_stop_id || "")
      const destination = stopById.get(route.destination_stop_id || "")
      const fromMatch = !from || `${origin?.name || ""} ${origin?.city || ""}`.toLowerCase().includes(from)
      const toMatch = !to || `${destination?.name || ""} ${destination?.city || ""}`.toLowerCase().includes(to)
      return fromMatch && toMatch
    })

    const results = matchingRoutes.map((route) => {
      const origin = stopById.get(route.origin_stop_id || "")
      const destination = stopById.get(route.destination_stop_id || "")
      const rule = fares.find((item) => item.route_id === route.id) || fares.find((item) => item.transport_mode === route.transport_mode && item.route_id === null)
      const baseFare = Number(rule?.base_fare || 0)
      const perKmFare = Number(rule?.per_km_fare || 0)
      const minimumFare = Number(rule?.minimum_fare || 0)
      const bookingFee = Number(rule?.booking_fee || 0)
      const distance = Number(route.distance_km || 0)
      const price = rule ? Math.max(minimumFare, baseFare + perKmFare * distance) + bookingFee : 0
      const mode = ["bus", "train", "metro", "cab"].includes(route.transport_mode) ? route.transport_mode : "bus"
      const duration = Number(route.estimated_duration_minutes || 60)
      return {
        id: route.id,
        routeCode: route.route_code,
        routeName: route.route_name,
        totalDuration: duration,
        totalPrice: Math.round(price * 100) / 100,
        fareAvailable: Boolean(rule),
        totalWalkTime: 0,
        transfers: 0,
        recommendation: undefined,
        segments: [{
          type: mode,
          name: route.route_name,
          from: origin ? `${origin.name} (${origin.city})` : "Origin unavailable",
          to: destination ? `${destination.name} (${destination.city})` : "Destination unavailable",
          duration,
          price: Math.round(price * 100) / 100,
        }],
      }
    })

    if (results.length > 0) {
      const fastest = [...results].sort((a, b) => a.totalDuration - b.totalDuration)[0]
      const fareAvailable = results.filter((route) => route.fareAvailable)
      const cheapest = [...fareAvailable].sort((a, b) => a.totalPrice - b.totalPrice)[0]
      for (const route of results) {
        if (cheapest && route.id === cheapest.id) route.recommendation = "cheapest"
        else if (route.id === fastest.id) route.recommendation = "fastest"
      }
    }

    return NextResponse.json({ routes: results, count: results.length, source: "supabase" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error while loading routes."
    const status = message.includes("not configured") ? 503 : 500
    return jsonError(message, status)
  }
}
