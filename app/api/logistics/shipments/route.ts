import { NextResponse } from 'next/server'
import { apiError, getUser, supabaseRest } from '@/lib/server-supabase'
function bearer(request: Request) { return request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '' }
type Shipment = { id: string; tracking_number: string; shipment_type: string; origin_city: string; destination_city: string; weight_kg: number; distance_km: number; estimated_fare: number; delivery_speed: string; status: string; created_at: string }
export async function GET(request: Request) {
  try {
    const token = bearer(request); if (!token) return NextResponse.json({ error: 'Sign in to view your shipments.' }, { status: 401 })
    const user = await getUser(token); if (!user) return NextResponse.json({ error: 'Your session has expired. Sign in again.' }, { status: 401 })
    const shipments = await supabaseRest<Shipment[]>(`logistics_shipments?select=id,tracking_number,shipment_type,origin_city,destination_city,weight_kg,distance_km,estimated_fare,delivery_speed,status,created_at&user_id=eq.${encodeURIComponent(user.id)}&order=created_at.desc`, { token })
    return NextResponse.json({ shipments })
  } catch (error) { return apiError(error) }
}
export async function POST(request: Request) {
  try {
    const token = bearer(request); if (!token) return NextResponse.json({ error: 'Sign in before creating a shipment.' }, { status: 401 })
    const user = await getUser(token); if (!user) return NextResponse.json({ error: 'Your session has expired. Sign in again.' }, { status: 401 })
    const b = await request.json()
    const type = String(b.shipmentType || 'parcel'); const speed = String(b.deliverySpeed || 'standard'); const distance = Number(b.distanceKm); const weight = Number(b.weightKg)
    const required = ['originAddress','originCity','destinationAddress','destinationCity']
    if (!['parcel','cargo'].includes(type) || !['standard','express'].includes(speed) || !Number.isFinite(distance) || distance <= 0 || !Number.isFinite(weight) || weight <= 0 || required.some(k => !String(b[k] || '').trim())) return NextResponse.json({ error: 'Fill in all required addresses, cities, positive weight and distance, shipment type, and delivery speed.' }, { status: 400 })
    const fareRows = await supabaseRest<{ calculate_logistics_fare: number | string }[]>('rpc/calculate_logistics_fare', { method: 'POST', token, body: { p_shipment_type: type, p_distance_km: distance, p_weight_kg: weight, p_delivery_speed: speed } })
    const fare = Number(fareRows?.[0]?.calculate_logistics_fare ?? fareRows as unknown as number)
    const shipment = await supabaseRest<Shipment[]>('logistics_shipments', { method: 'POST', token, prefer: 'return=representation', body: { user_id: user.id, shipment_type: type, origin_address: String(b.originAddress).trim(), origin_city: String(b.originCity).trim(), destination_address: String(b.destinationAddress).trim(), destination_city: String(b.destinationCity).trim(), weight_kg: weight, cargo_description: String(b.description || '').trim() || null, delivery_speed: speed, distance_km: distance, estimated_fare: fare, currency: 'INR', sender_name: String(b.senderName || '').trim() || null, sender_phone: String(b.senderPhone || '').trim() || null, receiver_name: String(b.receiverName || '').trim() || null, receiver_phone: String(b.receiverPhone || '').trim() || null } })
    return NextResponse.json({ shipment: shipment?.[0], note: 'This creates a shipment request in your database; no courier pickup or real-world delivery is arranged automatically.' }, { status: 201 })
  } catch (error) { return apiError(error) }
}
