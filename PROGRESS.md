# PROGRESS · Menú Digital

## Resumen

Aplicación web de gestión de menús de restaurante construida con Slice.js. Cumple los 10 requerimientos técnicos del Proyecto 1.

## Estado de requerimientos

| Req | Estado | Notas |
|-----|--------|-------|
| R01 — Slice.js |  Completado | App construida con Custom Elements + runtime Slice.js |
| R02 — Contexto global |  Completado | `restaurantContext` con restaurante, categorías, platos, combos, órdenes, tasas |
| R03 — Eventos |  Completado | `modal:open/close`, `cart:updated`, `plato:created/updated/deleted`, `search:changed`, `currency:changed`, `rates:updated`, `orders:updated`, etc. |
| R04 — ThemeManager |  Completado | Temas Light/Dark con persistencia en localStorage, toggle inmediato |
| R05 — Tema propio |  Completado | Paleta terracota/ámbar/salvia personalizada, documentada en README |
| R06 — Entidades |  Completado | Restaurante, Categoría, Plato, Combo, Orden (5 entidades, con relaciones) |
| R07 — Modal |  Completado | AppModal con formularios de creación/edición, abierto/cerrado vía eventos |
| R08 — Router |  Completado | 4 rutas: `/`, `/menu/:id`, `/finanzas`, `/404` |
| R09 — API externa |  Completado | Frankfurter API + DolarAPI para tasas de cambio (backend proxy) |
| R10 — Arquitectura |  Completado | Componentes, servicios, vistas separados; responsabilidad única |

## Historial de avances

### 2026-05-25 — Inicio del proyecto

- Configuración inicial del proyecto Slice.js con `slice init`
- Instalación de dependencias (slicejs-web-framework, slicejs-cli)
- Estructura base de carpetas: Components, Themes, Styles
- sliceConfig.json con paths, themes, router, events y context habilitados

### 2026-05-27 — Entidades y API

- Creación de entidades: Restaurante, Categoría, Plato, Combo, Orden
- Esquema de base de datos PostgreSQL
- Implementación de ApiService para comunicación con el backend
- Rutas CRUD en Express (restaurant, categories, dishes, combos, orders)
- Proxy de tasas de cambio con Frankfurter API + DolarAPI

### 2026-05-29 — Store y contexto global

- Implementación de RestaurantStore con lógica de negocio
- Integración de `slice.context.create()` para estado global
- Persistencia bidireccional: PostgreSQL + localStorage fallback
- Eventos del dominio: `plato:created`, `plato:updated`, `categoria:deleted`, etc.

### 2026-06-01 — Componentes visuales base

- Navbar con `static props` para logo, items y botones
- Sidebar con navegación y colapso persistente
- ThemeToggle con `slice.setTheme()` y modo claro/oscuro
- PlatoCard y ComboCard con conversión de moneda desde contexto
- SearchBar y CategoryCarousel con emisión de eventos

### 2026-06-04 — Vistas del router

- AppShell como composition root (construye servicios y layout)
- AdminDashboard con CRUD de platos y combos
- PublicMenu con búsqueda, filtros y carrito
- FinancialSimulator con tasas de cambio y reporte de ventas
- NotFound para rutas inválidas

### 2026-06-07 — Modal y carrito

- AppModal controlado por eventos (`modal:open` / `modal:close`)
- Formularios de creación y edición de platos dentro del modal
- CartDrawer con panel lateral, ajuste de cantidades y checkout
- CartService con persistencia en localStorage
- Integración de checkout con API de órdenes

### 2026-06-09 — Selector de moneda y pulido

- CurrencySwitcher con cambio de moneda en vivo
- Conversión de precios en todos los componentes visuales
- ExchangeService con carga asíncrona y fallback
- Sidebar responsive con overlay mobile
- Ajustes de estilo y consistencia visual

### 2026-06-11 — Documentación y ajustes finales

- README.md con diseño visual, stack, entidades y requerimientos
- PROGRESS.md con historial de avances
- Alineación de iconos en sidebar
- Pruebas de flujo completo (admin → menú → carrito → checkout → finanzas)

