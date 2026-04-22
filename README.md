# TECK QB — Dashboard Medición de Espesores

Dashboard web para análisis de espesores de ductos en estaciones PS1, PS2 y VS2 de TECK Quebrada Blanca.

## Stack

- **Frontend:** React + Vite + Chart.js
- **Backend/DB:** Supabase (PostgreSQL + Auth)

---

## Setup Supabase

### 1. Crear proyecto
1. Ir a [supabase.com](https://supabase.com) → New project
2. Guardar la **Project URL** y la **anon public key**

### 2. Crear tablas y datos
En el SQL Editor de Supabase, ejecutar en orden:
```
supabase/schema.sql   ← crea las tablas y políticas RLS
supabase/seed.sql     ← carga datos de inspecciones Marzo 2026
```

### 3. Crear usuario
En Supabase: **Authentication → Users → Add user → Create new user**
- Email: `moncon@teck-qb.app`
- Password: (la que definas — se recomienda una contraseña segura)
- ✅ Auto Confirm User

### 4. Variables de entorno
```bash
cp .env.example .env
# Editar .env con tu URL y anon key de Supabase
```

---

## Desarrollo local

```bash
npm install
npm run dev
```

---

## Estructura de datos

```
stations      → PS1, PS2, VS2
inspections   → Una por campaña (cada ~4 meses)
pipe_lines    → Líneas/spools inspeccionados
measurements  → Espesor (mm) por anillo y ángulo (0°–315°)
```
