import { NextResponse } from 'next/server'
import { apiError, supabaseRest } from '@/lib/server-supabase'
export async function GET(request: Request) {
  try {
    const p = new URL(request.url).searchParams
    const type = p.get('type') || 'parcel'; const distance = Number(p.get('distance')); const weight = Number(p.get('weight')); const speed = p.get('speed') || 'standard'
    if (!['parcel','cargo'].includes(type) || !['standard','express'].includes(speed) || !Number.isFinite(distance) || distance <= 0 || !Number.isFinite(weight) || weight <= 0) return NextResponse.json({ error: 'Provide type=parcel|cargo, speed=standard|express, and positive distance and weight values.' }, { status: 400 })
    const rows = await supabaseRest<{ calculate_logistics_fare: number | string }[]>('rpc/calculate_logistics_fare', { method: 'POST', body: { p_shipment_type: type, p_distance_km: distance, p_weight_kg: weight, p_delivery_speed: speed } })
    return NextResponse.json({ type, distanceKm: distance, weightKg: weight, speed, currency: 'INR', estimatedFare: Number(rows?.[0]?.calculate_logistics_fare ?? rows as unknown as number), sampleRates: true, note: 'Estimate uses the current active sample fare rule. Distance is user-provided and should be confirmed before a real booking.' })
  } catch (error) { return apiError(error) }
}
