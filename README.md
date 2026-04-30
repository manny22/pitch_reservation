# La Red — Reserva de canchas deportivas

> MVP web (PWA-ready) construido en **Angular 20** para la reserva de canchas sintéticas en Cartagena. Permite a los jugadores buscar, ver en mapa, reservar y pagar canchas; y a los administradores gestionar su catálogo, disponibilidad y promociones.

Repositorio: <https://github.com/manny22/pitch_reservation>

---

## Tabla de contenido

1. [Stack tecnológico](#stack-tecnológico)
2. [Arquitectura](#arquitectura)
3. [Estructura de carpetas](#estructura-de-carpetas)
4. [Capa de dominio](#capa-de-dominio)
5. [Capa de aplicación (facades)](#capa-de-aplicación-facades)
6. [Capa de infraestructura](#capa-de-infraestructura)
7. [Core: auth, guards, interceptors](#core-auth-guards-interceptors)
8. [Features (UI)](#features-ui)
9. [Routing y lazy-loading](#routing-y-lazy-loading)
10. [Diseño y theming Material](#diseño-y-theming-material)
11. [Mapa interactivo con Leaflet](#mapa-interactivo-con-leaflet)
12. [Geolocalización del usuario](#geolocalización-del-usuario)
13. [Buenas prácticas de seguridad](#buenas-prácticas-de-seguridad)
14. [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)
15. [Scripts disponibles](#scripts-disponibles)
16. [Roadmap](#roadmap)

---

## Stack tecnológico

| Categoría        | Tecnología                                       |
| ---------------- | ------------------------------------------------ |
| Framework        | Angular **20.3** (standalone components, signals) |
| UI               | Angular Material **20.2** + CDK                  |
| Mapas            | Leaflet **1.9** + OpenStreetMap                  |
| Estado           | Angular Signals + RxJS                           |
| Reactividad HTTP | `provideHttpClient` + interceptors funcionales   |
| Formularios      | Reactive Forms                                   |
| Routing          | Standalone Router con `loadComponent` lazy       |
| Build            | `@angular/build` (esbuild)                       |
| Testing          | Karma + Jasmine                                  |

---

## Arquitectura

El proyecto sigue una **Clean Architecture** con cuatro capas claramente separadas, donde las dependencias **siempre apuntan hacia adentro** (los detalles dependen de los contratos, nunca al revés):

```
┌──────────────────────────────────────────────┐
│           features/  (UI · pages)            │   ← Componentes Angular
├──────────────────────────────────────────────┤
│         application/  (facades)              │   ← Casos de uso
├──────────────────────────────────────────────┤
│           domain/  (modelos + repos)         │   ← Entidades y contratos
├──────────────────────────────────────────────┤
│   infrastructure/  (impl. de repositorios)   │   ← In-memory · HTTP · gateways
└──────────────────────────────────────────────┘
            ▲                          ▲
            │                          │
        core/ (auth, guards, interceptors, providers)
        shared/ (componentes y pipes reutilizables)
```

### Beneficios

- El **dominio no conoce Angular**: los modelos son interfaces TS puras y los repositorios son clases abstractas.
- La **infraestructura es intercambiable**: hoy es `InMemory*Repository`; mañana puede ser `Http*Repository` sin tocar UI ni casos de uso.
- Las **facades** orquestan los casos de uso y exponen una API estable a los componentes.
- Los **componentes** son tontos: solo renderizan estado y disparan acciones.

---

## Estructura de carpetas

```
src/app/
├── app.config.ts          # Providers globales (router, http, animations, material)
├── app.routes.ts          # Definición de rutas con lazy-loading
├── app.ts / app.html      # Componente raíz
│
├── domain/                # Entidades y contratos (sin dependencias externas)
│   ├── booking/
│   ├── court/
│   ├── payment/
│   ├── promotion/
│   ├── review/
│   └── user/
│
├── application/           # Casos de uso (facades) que orquestan dominio + infra
│   ├── booking/booking.facade.ts
│   ├── court/court.facade.ts
│   ├── payment/payment.facade.ts
│   ├── promotion/promotion.facade.ts
│   └── review/review.facade.ts
│
├── infrastructure/        # Implementaciones concretas
│   ├── data/seed.data.ts                     # Datos mock de canchas, reservas, promos
│   ├── booking/in-memory-booking.repository.ts
│   ├── court/in-memory-court.repository.ts
│   ├── payment/mock-payment.gateway.ts
│   ├── promotion/in-memory-promotion.repository.ts
│   └── review/in-memory-review.repository.ts
│
├── core/                  # Servicios transversales
│   ├── auth/auth.service.ts                  # Login mock + signal del usuario
│   ├── guards/role.guard.ts                  # Control de acceso por rol
│   ├── interceptors/
│   │   ├── auth.interceptor.ts               # Inyecta token (mock)
│   │   ├── loading.interceptor.ts            # Estado global de loading
│   │   └── error.interceptor.ts              # Snackbar para errores HTTP
│   └── services/loading.service.ts
│
├── shared/                # UI y utilidades reusables
│   ├── components/
│   │   ├── court-card/                       # Card de cancha
│   │   ├── court-map/                        # ⭐ Wrapper de Leaflet
│   │   ├── empty-state/
│   │   ├── layout/  (header, footer, shell)
│   │   ├── loading/
│   │   └── rating-stars/
│   └── pipes/currency-cop.pipe.ts            # Formato $ COP
│
└── features/              # Pantallas finales
    ├── auth/login/
    ├── client/
    │   ├── home/
    │   ├── search/                           # Listado + filtros
    │   ├── map/                              # ⭐ /mapa con geolocalización
    │   ├── detail/                           # Detalle de cancha
    │   ├── booking/                          # Selección de horario
    │   ├── payment/                          # Pago (gateway mock)
    │   ├── confirmation/
    │   └── my-bookings/
    └── admin/
        ├── shell/                            # Layout con sidenav
        ├── dashboard/                        # KPIs y métricas
        ├── courts/                           # CRUD de canchas
        ├── bookings/                         # Gestión de reservas
        └── promotions/                       # Gestión de promociones
```

---

## Capa de dominio

Modelos como interfaces TypeScript inmutables y repositorios como **clases abstractas** que definen el contrato.

Ejemplo — [src/app/domain/court/court.model.ts](src/app/domain/court/court.model.ts):

```ts
export interface Court {
  id: string;
  name: string;
  type: '5' | '7' | '8' | '11';
  pricePerHour: number;
  available: boolean;
  location: { latitude: number; longitude: number; zone: string };
  // ...
}
```

Ejemplo — [src/app/domain/court/court.repository.ts](src/app/domain/court/court.repository.ts):

```ts
export abstract class CourtRepository {
  abstract findAll(): Observable<Court[]>;
  abstract findById(id: string): Observable<Court | undefined>;
  abstract search(filters: CourtFilters): Observable<Court[]>;
}
```

Esto permite que en `app.config.ts` se haga el binding:

```ts
{ provide: CourtRepository, useClass: InMemoryCourtRepository }
```

---

## Capa de aplicación (facades)

Cada facade expone los **casos de uso** que la UI necesita, ocultando la composición de repositorios y la lógica de negocio.

Ejemplo — [src/app/application/court/court.facade.ts](src/app/application/court/court.facade.ts):

```ts
@Injectable({ providedIn: 'root' })
export class CourtFacade {
  private readonly repo = inject(CourtRepository);

  list()   { return this.repo.findAll(); }
  byId(id) { return this.repo.findById(id); }
  search(f){ return this.repo.search(f); }
}
```

---

## Capa de infraestructura

- **Repositorios in-memory** que simulan backend con `of(...)` + `delay()` para sentir un comportamiento async realista.
- **`MockPaymentGateway`** que simula transacciones (90% éxito, 10% fallo) para probar flujos.
- **Seed centralizado** en [src/app/infrastructure/data/seed.data.ts](src/app/infrastructure/data/seed.data.ts) con canchas reales de Cartagena (lat/long verídicos).

Cuando exista un backend real, basta con crear `HttpCourtRepository extends CourtRepository` y cambiar el binding en `app.config.ts`. **Cero impacto en el resto del código**.

---

## Core: auth, guards, interceptors

### Autenticación
[`AuthService`](src/app/core/auth/auth.service.ts) mantiene el usuario en un `signal<User | null>` y persiste en `localStorage`. Soporta tres roles:

- `client` — jugador final
- `court_admin` — dueño de canchas
- `platform_admin` — administrador global

### Guards
[`roleGuard('court_admin', 'platform_admin')`](src/app/core/guards/role.guard.ts) protege la sección `/admin`. Si no hay sesión, redirige a `/login`; si el rol no califica, a `/`.

### Interceptors funcionales
Registrados con `withInterceptors([...])` en [src/app/app.config.ts](src/app/app.config.ts):

| Interceptor       | Responsabilidad                                                  |
| ----------------- | ---------------------------------------------------------------- |
| `authInterceptor` | Inserta `Authorization: Bearer <token>` si hay sesión             |
| `loadingInterceptor` | Activa/desactiva un signal global de loading por request      |
| `errorInterceptor`| Captura errores HTTP y muestra `MatSnackBar` con mensaje claro    |

---

## Features (UI)

Todos los componentes son **standalone**, usan **`ChangeDetectionStrategy.OnPush`** y nuevo control flow `@if` / `@for`.

### Cliente
- **Home** — landing con hero, promociones destacadas y CTA de búsqueda.
- **Search** — `/canchas` con filtros (zona, tipo, precio, disponibilidad).
- **Map** — `/mapa` con todas las canchas geolocalizadas.
- **Detail** — `/canchas/:id` con galería, reseñas, mapa y "Cómo llegar".
- **Booking** — `/reservar/:courtId` con selección de fecha/hora y validación de cupos.
- **Payment** — `/pagar/:bookingId` con simulación de pasarela.
- **Confirmation** — recibo con QR (placeholder).
- **My-bookings** — historial del usuario.

### Admin
- **Dashboard** con KPIs (reservas hoy, ingresos mes, ocupación %).
- **Courts** — CRUD de canchas.
- **Bookings** — listado/filtros + cambio de estado.
- **Promotions** — descuentos por porcentaje o monto fijo.

---

## Routing y lazy-loading

Definido en [src/app/app.routes.ts](src/app/app.routes.ts). Todas las rutas se cargan con `loadComponent` para mantener el bundle inicial bajo (~636 KB raw / ~163 KB transferidos).

```ts
{ path: 'mapa',
  loadComponent: () =>
    import('./features/client/map/courts-map-page.component')
      .then(m => m.CourtsMapPageComponent),
  title: 'Mapa de canchas · La Red',
}
```

La sección `/admin/**` se carga solo si pasa `roleGuard`.

---

## Diseño y theming Material

Configurado con el nuevo `mat.theme()` mixin de Angular Material 20 en [src/styles.scss](src/styles.scss):

- **Primary**: verde (#2e7d32) — disponibilidad, CTA principales.
- **Tertiary**: naranja — alertas y acentos.
- Densidad y tipografía Roboto.
- Layout responsive con grid CSS y media queries en cada componente.

---

## Mapa interactivo con Leaflet

Encapsulado en el componente reutilizable [`<app-court-map>`](src/app/shared/components/court-map/court-map.component.ts).

### Configuración

1. Dependencias instaladas:
   ```bash
   npm install leaflet @types/leaflet
   ```
2. CSS registrado en [angular.json](angular.json) en `styles[]` (build y test):
   ```json
   "styles": ["src/styles.scss", "node_modules/leaflet/dist/leaflet.css"]
   ```
3. Declarado en `allowedCommonJsDependencies` para silenciar el warning de bundling.

### API del componente

| Input               | Tipo        | Default   | Descripción                                  |
| ------------------- | ----------- | --------- | -------------------------------------------- |
| `courts`            | `Court[]`   | `[]`      | Canchas a renderizar como marcadores         |
| `height`            | `string`    | `'400px'` | Alto del contenedor                          |
| `fitBounds`         | `boolean`   | `true`    | Auto-zoom para mostrar todas las canchas     |
| `interactive`       | `boolean`   | `true`    | Habilita zoom, drag, scroll                  |
| `locateUser`        | `boolean`   | `false`   | Activa la geolocalización (ver sección)      |

| Output              | Tipo                          | Descripción                          |
| ------------------- | ----------------------------- | ------------------------------------ |
| `geolocationError`  | `GeolocationErrorReason`      | Problema al obtener ubicación        |
| `userLocated`       | `GeolocationCoordinates`      | Coordenadas del usuario actualizadas |

### Marcadores

- 🟢 **Verde** (`#2e7d32`) — cancha disponible.
- ⚪ **Gris** (`#9e9e9e`) — cancha no disponible.
- Popup con nombre, zona, precio y enlace al detalle (navegación SPA con Router).

### Uso

```html
<!-- En /mapa: muestra todas las canchas + ubicación del usuario -->
<app-court-map
  [courts]="filtered()"
  height="70vh"
  [locateUser]="true"
  (geolocationError)="onGeoError($event)"
/>

<!-- En /canchas/:id: solo la cancha actual -->
<app-court-map [courts]="[c]" height="280px" />
```

Tiles servidos por **OpenStreetMap** (`https://{s}.tile.openstreetmap.org/...`). Sin tracking, sin API key.

---

## Geolocalización del usuario

Implementada en `CourtMapComponent` cuando `[locateUser]="true"`.

### Flujo

1. Al inicializar el mapa, valida que existan las precondiciones:
   - `'geolocation' in navigator` (API soportada).
   - `window.isSecureContext === true` (https o localhost).
2. Llama a `navigator.geolocation.watchPosition(...)` con:
   ```ts
   { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 }
   ```
3. Renderiza:
   - Un **círculo azul** con el radio de precisión real (`coords.accuracy`).
   - Un **marcador "Estás aquí"** centrado.
4. Añade un **botón flotante** (◉) en `topright` que recentra el mapa en el usuario; si aún no hay fix llama a `getCurrentPosition` bajo demanda.
5. En `ngOnDestroy`, llama a `navigator.geolocation.clearWatch(watchId)` para evitar leaks.

### Manejo de errores

El componente emite un `GeolocationErrorReason` tipado:

| Razón         | Cuándo                                                      |
| ------------- | ----------------------------------------------------------- |
| `unsupported` | `navigator.geolocation` no existe                            |
| `insecure`    | El sitio no es contexto seguro (sin https ni localhost)      |
| `denied`      | El usuario rechazó el permiso                                |
| `unavailable` | Posición no disponible (sin GPS / sin red Wi-Fi geolocalizada) |
| `timeout`     | Tardó más de 15s                                             |

La página `/mapa` los traduce a mensajes en español con `MatSnackBar`:

```ts
const messages: Record<GeolocationErrorReason, string> = {
  unsupported: 'Tu navegador no soporta geolocalización.',
  insecure:    'La geolocalización requiere HTTPS o localhost.',
  denied:      'Permiso de ubicación denegado. Actívalo en el navegador.',
  unavailable: 'No pudimos obtener tu ubicación en este momento.',
  timeout:     'Tomó demasiado tiempo obtener tu ubicación.',
};
```

### Solución de problemas comunes

| Síntoma                          | Causa                                       | Solución                                                                |
| -------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| No aparece el prompt de permiso  | Permiso bloqueado previamente               | Click en el candado 🔒 → Configuración del sitio → Ubicación → Permitir |
| `insecure` en snackbar           | Estás en `http://192.168.x.x` u otra IP LAN | Usa `http://localhost:4200`                                             |
| `unavailable`                    | PC sin GPS y Wi-Fi sin geolocalización      | Conéctate a una red conocida o usa móvil                                |
| Brave/extensiones bloquean       | Anti-tracking agresivo                      | Desactiva el escudo en el sitio                                         |

---

## Buenas prácticas de seguridad

Mitigaciones aplicadas alineadas con OWASP Top 10:

- **XSS**: todos los `innerHTML` (popups de Leaflet) se sanean con un `escapeHtml()` propio antes de inyectar nombres y zonas.
- **CSP-friendly**: ningún `onclick` inline; los listeners se enganchan con `addEventListener` después de abrir el popup.
- **Open redirects**: enlaces externos (OpenStreetMap "Cómo llegar") usan `rel="noopener noreferrer"` y `target="_blank"`.
- **Auth**: token mock se inyecta vía interceptor; no se expone en query strings.
- **Guards**: `roleGuard` valida rol antes de cargar el chunk de admin.
- **Sin telemetría**: solo se contacta `tile.openstreetmap.org`; sin Google Maps/analytics.
- **Geolocalización**: respeta `isSecureContext` y siempre muestra error explícito si el permiso es denegado.
- **Validación en formularios**: Reactive Forms con `Validators` en cliente; el dominio asume que repos pueden rechazar entradas inválidas.

---

## Cómo ejecutar el proyecto

### Requisitos
- Node.js **18+** (recomendado 20 LTS)
- npm **9+**

### Instalación

```bash
git clone https://github.com/manny22/pitch_reservation.git
cd pitch_reservation
npm install
```

### Servidor de desarrollo

```bash
npm start
```

Abrir <http://localhost:4200/>. Hot-reload activo.

> ⚠️ Para probar la geolocalización, **debe ser `localhost`** (o https). En IP de LAN la API queda deshabilitada.

### Build de producción

```bash
npm run build
```

Sale en `dist/pitch_reservation/`.

### Tests

```bash
npm test
```

---

## Scripts disponibles

| Script          | Descripción                                  |
| --------------- | -------------------------------------------- |
| `npm start`     | Dev server con HMR en `:4200`                |
| `npm run build` | Build de producción optimizado               |
| `npm run watch` | Build incremental para desarrollo            |
| `npm test`      | Tests unitarios con Karma + Jasmine          |

### Usuarios mock para login

| Email                      | Password | Rol               |
| -------------------------- | -------- | ----------------- |
| `cliente@lared.app`        | `123456` | `client`          |
| `dueno@lared.app`          | `123456` | `court_admin`     |
| `admin@lared.app`          | `123456` | `platform_admin`  |

---

## Roadmap

- [ ] Backend real (NestJS + PostgreSQL)
- [ ] Pasarela de pagos real (Wompi / PayU / Mercado Pago)
- [ ] Notificaciones push y por WhatsApp Business API
- [ ] PWA con cache offline (`@angular/service-worker`)
- [ ] Búsqueda por radio desde la ubicación del usuario ("canchas a 2 km")
- [ ] Reseñas con fotos
- [ ] App móvil con Capacitor

---

## Licencia

MIT — © 2026 La Red.
