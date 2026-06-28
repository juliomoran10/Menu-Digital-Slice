# Menú Digital — App de Gestión de Restaurantes

Aplicación web para la gestión digital de menús de restaurantes, construida con **Slice.js** (framework de componentes web basado en Custom Elements). Permite administrar platos, combos, categorías y pedidos, con un simulador cambiario para visualizar precios en múltiples monedas.

## Requisitos

- Node.js >= 20
- pnpm o npm

## Instalación y ejecución

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo (src/)
pnpm run dev

# Construir para producción
pnpm run build

# Iniciar servidor producción
pnpm run start
```

La aplicación se abre en `http://localhost:3000`.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework frontend | Slice.js 3.3.4 |
| Backend API | Node.js (Express) |
| Base de datos | PostgreSQL |
| Tasas de cambio | Frankfurter API + DolarAPI (Venezuela) |

## Vistas (Router)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | AdminDashboard | Panel administrativo: CRUD de platos, combos, estadísticas |
| `/menu/:id` | PublicMenu | Menú público del restaurante con buscador y carrito |
| `/finanzas` | FinancialSimulator | Simulador cambiario y reporte de ventas |
| `/404` | NotFound | Página no encontrada |

## Entidades modeladas

| Entidad | Atributos principales | Persistencia |
|---------|----------------------|-------------|
| Restaurante | id, nombre, monedaBase, logoUrl | PostgreSQL + localStorage fallback |
| Categoría | id, restauranteId, nombre, orden | PostgreSQL + localStorage fallback |
| Plato | id, categoriaId, nombre, descripcion, precioBase, disponible, imageUrl | PostgreSQL + localStorage fallback |
| Combo | id, nombre, descripcion, totalPrice, items[] | PostgreSQL + localStorage fallback |
| Orden | id, items[], total, currency, status, createdAt | PostgreSQL + localStorage |

Relaciones: `Categoría → Restaurante`, `Plato → Categoría`, `Combo → Plato` (items), `Orden → Plato/Combo`

## Diseño Visual

### Paleta de Colores (Terracota & Crema)

| Variable | Light | Dark |
|----------|-------|------|
| `--primary-color` | `#C85A3E` (terracota) | `#D4846A` (terracota claro) |
| `--secondary-color` | `#E8B84B` (ámbar dorado) | `#D4A373` (oro cálido) |
| `--primary-background` | `#FFF5ED` (crema cálido) | `#1C1814` (carbón cálido) |
| `--success-color` | `#5B8C5A` (verde bosque) | `#7BA87A` (verde musgo) |
| `--accent-color` | `#8FB08A` (salvia) | `#8FB08A` |

**Fundamento:** Los tonos terracota y crema evocan calidez, tierra y alimentos naturales — ideales para un restaurante. El ámbar dorado se usa para CTAs y acentos (añadir al carrito, botones de acción). El verde salvia como acento secundario aporta frescura y naturalidad.

### Tipografía

- **Principal:** System fonts (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`), priorizando legibilidad en pantallas.
- **Pesos:** 400 (regular) para cuerpo, 600 (semibold) para títulos.

### Espaciados y Bordes

- Radio de borde base: `8px` (`--border-radius-slice`)
- Sombras: `--box-shadow-primary` (terracota) y `--box-shadow-secondary` (ámbar) para tarjetas y elementos interactivos.

### Temas Claro/Oscuro

Ambos temas usan la misma paleta base con valores adaptados al fondo, garantizando contraste WCAG AA. El cambio es instantáneo vía `slice.setTheme()` y la preferencia persiste en localStorage.

## Requerimientos Técnicos (R01–R10)

| Req | Descripción | Estado |
|-----|------------|--------|
| R01 | Framework basado en componentes (Slice.js) |  
| R02 | Gestor de contexto / state global (`restaurantContext`) | 
| R03 | Gestor de eventos (`modal:open`, `cart:updated`, etc.) | 
| R04 | ThemeManager claro/oscuro con persistencia | 
| R05 | Tema visual propio (paleta terracota/ámbar) | 
| R06 | Mínimo 3 entidades modeladas (5 entidades con relaciones) | 
| R07 | Modal interactivo vía eventos (AppModal) | 
| R08 | Mínimo 3 vistas con router (4 rutas) | 
| R09 | Consumo de API externa (Frankfurter + DolarAPI) | 
| R10 | Arquitectura componentizada (Visual/Service/AppComponents) | 

## Arquitectura

```
src/
├── Components/
│   ├── Visual/            # Componentes de UI reutilizables
│   │   ├── AppModal/      # Modal genérico controlado por eventos
│   │   ├── CartDrawer/    # Carrito lateral
│   │   ├── ComboCard/     # Tarjeta de combo
│   │   ├── CurrencySwitcher/ # Selector de moneda
│   │   ├── Navbar/        # Barra de navegación
│   │   ├── PlatoCard/     # Tarjeta de plato
│   │   ├── SearchBar/     # Barra de búsqueda
│   │   ├── Sidebar/       # Menú lateral
│   │   └── ThemeToggle/   # Switch claro/oscuro
│   ├── Service/           # Lógica de negocio y API
│   │   ├── ApiService/    # Cliente HTTP para el backend
│   │   ├── CartService/   # Gestión del carrito
│   │   ├── ExchangeService/ # Tasas de cambio
│   │   └── RestaurantStore/ # Store principal (context facade)
│   └── AppComponents/     # Componentes de aplicación (vistas)
│       ├── AdminDashboard/  # CRUD de platos/combos
│       ├── FinancialSimulator/ # Simulador cambiario
│       └── PublicMenu/      # Menú público
├── Themes/                # Temas claro, oscuro
├── Styles/                # Estilos globales
├── App/                   # Punto de entrada
├── bundles/               # Configuración de bundles
├── routes.js              # Definición de rutas
└── sliceConfig.json       # Configuración del framework

api/                       # Backend (Express + PostgreSQL)
├── routes/
│   └── menu.js            # CRUD + proxy de tasas de cambio
├── middleware/
├── db.js
└── index.js
```
