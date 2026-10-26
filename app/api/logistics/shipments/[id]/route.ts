import { NextResponse } from 'next/server'
import { apiError, getUser, supabaseRest } from '@/lib/server-supabase'
function bearer(request: Request) { return request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '' }
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = bearer(request); if (!token) return NextResponse.json({ error: 'Sign in to view shipment tracking.' }, { status: 401 })
    const user = await getUser(token); if (!user) return NextResponse.json({ error: 'Your session has expired. Sign in again.' }, { status: 401 })
    const id = params.id
    const shipments = await supabaseRest<any[]>(`logistics_shipments?select=*&id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(user.id)}&limit=1`, { token })
    if (!shipments?.length) return NextResponse.json({ error: 'Shipment not found.' }, { status: 404 })
    const history = await supabaseRest<any[]>(`logistics_status_history?select=id,status,location,note,created_at&shipment_id=eq.${encodeURIComponent(id)}&order=created_at.asc`, { token })
    return NextResponse.json({ shipment: shipments[0], history })
  } catch (error) { return apiError(error) }
}
