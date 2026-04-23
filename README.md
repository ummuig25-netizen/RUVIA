# 🚖 RUVIA: Movilidad Urbana Inteligente

![RUVIA Banner](https://img.shields.io/badge/Status-Development-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)

**RUVIA** es una plataforma de movilidad diseñada para empoderar a los taxistas y ofrecer a los usuarios una alternativa segura, justa y transparente.

> "Conectando rutas, asegurando confianza."

---

## ✨ Características Innovadoras

- **Modelo Socio-Gremial:** Sin comisiones abusivas. Suscripción fija para conductores.
- **Price Lock:** Precio pactado al inicio inalterable.
- **Safe-Link Technology:** Monitoreo preventivo y círculos de confianza.
- **Dual Dashboard:** Interfaces optimizadas para Pasajeros y Conductores.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| **Frontend** | React.js + Tailwind CSS |
| **Backend / Real-time** | Supabase (PostgreSQL + Realtime) |
| **Mapas** | Leaflet.js |
| **Iconos** | Lucide-react |

---

## 🏗️ Arquitectura de la Base de Datos (SQL)

```sql
-- Ejecutar en el editor SQL de Supabase
CREATE TABLE profiles (id uuid REFERENCES auth.users, nombre text, rol text, PRIMARY KEY (id));
CREATE TABLE taxis (id uuid PRIMARY KEY, conductor_id uuid REFERENCES profiles(id), status text, lat float, lng float);
CREATE TABLE trips (id uuid PRIMARY KEY, pasajero_id uuid, conductor_id uuid, origen text, destino text, precio float, estado text);
