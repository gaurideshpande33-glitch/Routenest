import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'RouteNest | Transport & Logistics', description: 'Plan routes, explore bus and metro timetables, estimate parcel and cargo fares, and track shipment requests with RouteNest.' }
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html> }
