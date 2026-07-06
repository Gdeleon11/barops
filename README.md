# BarOps Pro — Nocturne Operational Interface

Plataforma full‑stack de gestión de bares y restaurantes. Construida con **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma + PostgreSQL** y **Auth.js (NextAuth v5)**. Tema oscuro "Nocturne" de alta fidelidad.

## ✨ Qué incluye

**Pantallas núcleo (full‑stack, datos reales en la base):**
- 🔐 Login con roles (Owner, Gerente, Mesero, Bartender, Cocina, Cajero) y multi‑sucursal
- 📊 Dashboard ejecutivo (ventas del día, órdenes activas, ocupación, stock bajo)
- 🧾 Punto de Venta (POS) — carrito, categorías, cobro, envío a cocina, IVA y propina
- 📦 Inventario general — alta de insumos, ajuste de stock, alertas de reposición
- 🍽️ Mesas y salones — cambio de estado por zona en tiempo real
- 👥 CRM de clientes — alta, búsqueda, lealtad, VIP, historial de gasto
- 📅 Reservas — alta y gestión de estados
- 🧑‍🍳 Personal y desempeño

**42 pantallas de diseño adicionales** (KDS, BDS, compras, firmware, topología de red, marketing WhatsApp, facturación SaaS, etc.) integradas y navegables desde el mismo panel.

## 🚀 Despliegue en Vercel (paso a paso)

### 1. Subir el código a GitHub
```bash
git remote add origin https://github.com/Gdeleon11/barops.git   # ya viene configurado
git push -u origin main
```

### 2. Crear una base de datos PostgreSQL (gratis)
Usa cualquiera de estas opciones y copia la **connection string**:
- **Vercel Postgres**: Dashboard de Vercel → Storage → Create Database → Postgres
- **Neon** (recomendado): https://neon.tech → nuevo proyecto → copia la `DATABASE_URL`
- **Supabase**: https://supabase.com → Project Settings → Database → Connection string (modo `Session`)

### 3. Importar el proyecto en Vercel
1. https://vercel.com/new → importa `Gdeleon11/barops`
2. Framework: **Next.js** (autodetectado)
3. En **Environment Variables** agrega:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | la connection string del paso 2 (con `?sslmode=require`) |
| `AUTH_SECRET` | genera uno con `openssl rand -base64 32` |

4. Deploy.

### 4. Crear las tablas y cargar datos demo (una sola vez)
Desde tu computadora, con la `DATABASE_URL` de producción en un archivo `.env`:
```bash
npm install
npx prisma db push     # crea las tablas en tu Postgres
npm run db:seed        # carga sucursales, usuarios, productos, mesas, clientes…
```
> Alternativa sin clonar: usa la consola SQL de Neon/Supabase y luego ejecuta el seed.

### 5. Entrar
Abre la URL de Vercel y entra con:

| Rol | Correo | Contraseña |
|---|---|---|
| Owner | `admin@barops.pro` | `admin123` |
| Gerente | `gerente@barops.pro` | `gerente123` |
| Mesero | `mesero@barops.pro` | `mesero123` |

**⚠️ Cambia estas contraseñas antes de usar en producción.**

## 🧑‍💻 Desarrollo local
```bash
npm install
cp .env.example .env        # coloca tu DATABASE_URL y AUTH_SECRET
npx prisma db push
npm run db:seed
npm run dev                 # http://localhost:3000
```

## 🗂️ Estructura
```
app/
  (auth)/login          Login (server action + Auth.js)
  (app)/                Layout con sidebar + pantallas protegidas
    dashboard  pos  inventory  tables  staff  customers  reservations
    m/[slug]            Render de las 42 pantallas de diseño
  api/                  Route handlers (orders, inventory, tables, customers, reservations, auth)
auth.config.ts          Config edge‑safe (middleware)
auth.ts                 Auth.js + Prisma (Node)
prisma/schema.prisma    Modelo de datos
prisma/seed.ts          Datos demo
lib/                    prisma, session helpers, nav
components/             Sidebar, Topbar, UI
public/mockups/         Las 42 pantallas de diseño (HTML)
```

## 🔧 Stack
Next.js 14.2 · React 18 · TypeScript · Tailwind 3 · Prisma 5 · Auth.js 5 · Zod · bcryptjs
