# RouteNest – Transport & Logistics Platform 🚍

A database-backed web application that combines public transportation information and parcel/cargo logistics into a single platform. RouteNest helps users explore routes, stops, and bus/metro schedules while providing parcel fare estimation and shipment tracking features.

---

## 👥 Team Members

**Course:** Database Management Systems  
**Institution:** MIT World Peace University (MIT-WPU)  
**Department:** DoEEE  
**Guided by:** Prajakta Pardeshi

| Name | Division | Roll No. | Batch | PRN |
|---|---|---|---|---|
| Gauri Deshpande | B | 1262241569 | G2 | 1262241569 |
| Arush Alshi | B | 1262241885 | G3 | 1262241885 |

---

## 📌 Problem Statement

Passengers often need to use separate platforms to find transportation routes, stops, and schedules. Similarly, parcel and cargo services require users to access separate systems to estimate delivery charges and track shipments.

This fragmentation makes travel planning and logistics management less convenient.

**RouteNest aims to address this problem** by bringing transportation information and parcel/cargo logistics into one database-backed platform.

### Project Scope

- Route and stop lookup.
- Bus and metro timetable viewing.
- Booking preview and EcoScore functionality.
- Parcel and cargo fare estimation.
- Shipment tracking and status history.

**Note:** The current project uses sample schedules and fares. It is a prototype and does not replace official transport operator systems.

---

## 🎯 Project Objectives

1. Design a relational PostgreSQL database for routes, stops, schedules, bookings, and shipments.
2. Implement SQL queries using primary keys, foreign keys, constraints, and joins.
3. Provide a web interface for transportation search and logistics workflows.
4. Support parcel/cargo fare estimation and shipment status tracking.
5. Demonstrate database integration through Supabase.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Node.js API routes |
| Database | Supabase PostgreSQL |
| Database Client | Supabase JavaScript Client |
| Version Control | Git and GitHub |
| Development Environment | Node.js and npm |

---

## 🗄️ Database Design

RouteNest uses a relational database to organize transportation and logistics information.

### Main Database Tables

| Table | Purpose |
|---|---|
| `routes` | Stores route codes, route names, transport modes, and stop references. |
| `stops` | Stores stop names, city information, and location coordinates. |
| `route_stops` | Maps stops to routes and maintains their sequence. |
| `logistics_shipments` | Stores shipment details, tracking information, and status. |

The database uses primary keys and foreign keys to establish relationships between related records.

### ER Diagram

<img width="1374" height="850" alt="supabase-schema-dkulzsoquuggvnydtato" src="https://github.com/user-attachments/assets/d1d92d79-a7d0-49a4-909c-838a3d5f988c" />


---

## ⚙️ Setup and Installation

Follow these steps to run RouteNest locally.

### Prerequisites

Install the following:

- Node.js and npm.
- Git.
- A Supabase account.
- Access to the RouteNest repository.

### Step 1: Clone the Repository

```bash
git clone https://github.com/gaurideshpande33-glitch/Routenest.git
```

### Step 2: Navigate to the Project Folder

```bash
cd Routenest
```

### Step 3: Install Dependencies

If the repository contains a `package-lock.json`, run:

```bash
npm install
```

If the project is configured for pnpm instead, use the package manager and lockfile specified by the repository.

### Step 4: Configure Environment Variables

Create a `.env.local` file in the project root.

Add the environment variables required by the project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Replace the placeholders with your actual Supabase project values.

**Security:** Never commit `.env.local`, database passwords, service-role keys, or other private credentials to GitHub. Keep server-only secrets out of client-side environment variables.

### Step 5: Configure the Database

1. Open your Supabase project.
2. Navigate to the SQL Editor.
3. Execute the database schema SQL files included in the repository.
4. Verify that the required tables and relationships have been created.
5. Configure Row Level Security (RLS) policies where required.
6. Add sample records if the application requires them.

Use the SQL files available in the repository rather than assuming that every table or policy is already configured.

### Step 6: Start the Development Server

For a Next.js project, run:

```bash
npm run dev
```

Open the following address in your browser:

`http://localhost:3000`

Ensure that the development server starts successfully and that the application can connect to Supabase.

**Troubleshooting:** If the `dev` command is unavailable, check the `scripts` section of `package.json`. If database queries fail, verify the environment variables, table names, permissions, and RLS policies.

---

## 📸 Screenshots


### 1. Home Page

<img width="1514" height="692" alt="image" src="https://github.com/user-attachments/assets/1c131cc6-c9ca-4976-a250-b54fffe09e82" />


### 2. Route and Stop Search

<img width="1413" height="695" alt="image" src="https://github.com/user-attachments/assets/3da7f372-691a-491b-ad20-a2e56ab592e3" />


### 3. Bus and Metro Timetables

<img width="1304" height="683" alt="image" src="https://github.com/user-attachments/assets/07d1a0b1-78aa-4e01-ab69-ebc4da407d4b" />


### 4. Parcel and Cargo Fare Estimation

<img width="1285" height="656" alt="image" src="https://github.com/user-attachments/assets/208fd34f-7203-4247-a3fc-55b60ef0f16b" />


---

## 🧪 Database Implementation

The project demonstrates relational database concepts, including:

- Primary keys and foreign keys.
- Relational table design.
- SQL joins.
- Views.
- Data integrity constraints.
- Route and stop queries.
- Shipment status management.

### Example SQL Join

```sql
SELECT
    r.route_code,
    r.route_name,
    s.name AS stop_name,
    rs.stop_order
FROM public.routes r
JOIN public.route_stops rs
    ON r.id = rs.route_id
JOIN public.stops s
    ON rs.stop_id = s.id
ORDER BY
    r.route_code,
    rs.stop_order;
```

This query retrieves route information along with its associated stops in their specified sequence.

---

## 🌱 SDG Mapping

RouteNest and its EcoScore feature can contribute to the following United Nations Sustainable Development Goals:

| SDG | Goal | Project Contribution |
|---|---|---|
| SDG 11 | Sustainable Cities and Communities | Encourages public transport use through rewards and redeemable passes. |
| SDG 13 | Climate Action | Incentivizes sustainable travel choices and supports environmental initiatives. |
| SDG 9 | Industry, Innovation and Infrastructure | Uses a digital platform to integrate transportation and logistics workflows. |
| SDG 15 | Life on Land | Enables users to redeem EcoScore points for tree-planting initiatives. |

---

## 🚀 Future Scope

Potential future enhancements include:

- Real-time bus and metro schedules.
- Machine-learning-based transport occupancy prediction.
- Authenticated shipment creation and real-time tracking.
- Verified online payment integration.
- Expanded transport operator integrations.
- Enhanced analytics for transport usage.

---

## 👨‍💻 Individual Contributions

| Team Member | Contribution |
|---|---|
| Gauri Deshpande | Table design, frontend and backend integration, and cloud database setup. |
| Arush Alshi | Table design and frontend development. |



## 📚 References

1. [PostgreSQL Documentation](https://www.postgresql.org/docs/)
2. [Supabase Documentation](https://supabase.com/docs)
3. [Next.js Documentation](https://nextjs.org/docs)
4. [United Nations Sustainable Development Goals](https://sdgs.un.org/goals)
5. Silberschatz, Korth, and Sudarshan, *Database System Concepts*, McGraw-Hill.

---

## 🔗 Project Repository

**GitHub:** https://github.com/gaurideshpande33-glitch/Routenest

**Project:** RouteNest – Transport & Logistics Platform  
**Course:** Database Management Systems  
**Institution:** MIT World Peace University (MIT-WPU)

---

