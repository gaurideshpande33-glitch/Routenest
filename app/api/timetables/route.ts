import { NextResponse } from 'next/server'
import { apiError, supabaseRest } from '@/lib/server-supabase'

type Schedule = { id: string; route_id: string; vehicle_id: string | null; service_name: string | null; transport_mode: string; first_departure_time: string | null; last_departure_time: string | null; frequency_minutes: number | null; departure_time: string | null; arrival_time: string | null; days_of_week: number[]; effective_from: string; effective_until: string | null; sample_data: boolean; active: boolean }
type Route = { id: string; route_code: string | null; route_name: string; transport_mode: string; origin_stop_id: string | null; destination_stop_id: string | null; estimated_duration_minutes: number | null; distance_km: number | string | null }
type Stop = { id: string; name: string; city: string }
type StopTime = { schedule_id: string; stop_id: string; stop_order: number; arrival_time: string | null; departure_time: string | null }
export async function GET(request: Request) {
  try {
    const mode = new URL(request.url).searchParams.get('mode') || 'all'
    if (!['all', 'bus', 'metro'].includes(mode)) return NextResponse.json({ error: 'Mode must be all, bus, or metro.' }, { status: 400 })
    const [schedules, routes, stops, times] = await Promise.all([
      supabaseRest<Schedule[]>('transit_schedules?select=id,route_id,vehicle_id,service_name,transport_mode,first_departure_time,last_departure_time,frequency_minutes,departure_time,arrival_time,days_of_week,effective_from,effective_until,sample_data,active&active=eq.true&order=transport_mode,departure_time'),
      supabaseRest<Route[]>('routes?select=id,route_code,route_name,transport_mode,origin_stop_id,destination_stop_id,estimated_duration_minutes,distance_km&active=eq.true'),
      supabaseRest<Stop[]>('stops?select=id,name,city&active=eq.true'),
      supabaseRest<StopTime[]>('transit_stop_times?select=schedule_id,stop_id,stop_order,arrival_time,departure_time&order=stop_order')
    ])
    const routeMap = new Map(routes.map(r => [r.id, r])); const stopMap = new Map(stops.map(s => [s.id, s]))
    const data = schedules.filter(s => mode === 'all' || s.transport_mode === mode).map(s => {
      const route = routeMap.get(s.route_id); const stopTimes = times.filter(t => t.schedule_id === s.id).sort((a,b) => a.stop_order-b.stop_order)
      const origin = stopMap.get(stopTimes[0]?.stop_id || route?.origin_stop_id || '')
      const destination = stopMap.get(stopTimes[stopTimes.length-1]?.stop_id || route?.destination_stop_id || '')
      return { ...s, routeName: route?.route_name || 'Route', routeCode: route?.route_code || null, origin: origin ? `${origin.name}, ${origin.city}` : 'Origin not listed', destination: destination ? `${destination.name}, ${destination.city}` : 'Destination not listed', distanceKm: Number(route?.distance_km || 0), durationMinutes: Number(route?.estimated_duration_minutes || 0), stopTimes: stopTimes.map(t => ({ ...t, stopName: stopMap.get(t.stop_id)?.name || 'Stop' })) }
    })
    return NextResponse.json({ schedules: data, note: 'Schedules marked sample_data are illustrative demo times, not official operator timetables.' })
  } catch (error) { return apiError(error) }
}
