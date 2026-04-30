Actúa como un Senior Frontend Architect experto en Angular 20, TypeScript, Clean Architecture, Angular Material, diseño responsivo, seguridad frontend, buenas prácticas de UX/UI y arquitectura escalable.

Necesito crear una aplicación web responsiva para la reserva de canchas deportivas. La aplicación debe estar desarrollada con Angular 20, usando TypeScript, Angular Material y una arquitectura limpia, modular y mantenible.

El objetivo es construir una aplicación profesional para que los clientes puedan buscar, visualizar, comentar, calificar, reservar y pagar canchas en línea, y para que los administradores puedan gestionar las canchas, fotos, comentarios, calificaciones, reservas, ingresos, descuentos y promociones.

## Nombre tentativo de la aplicación

Cancha Booking App

## Stack técnico requerido

- Angular 20
- TypeScript
- Angular Material
- Angular CDK
- Reactive Forms
- Standalone Components
- Signals cuando sea útil
- RxJS
- SCSS
- Responsive Design
- Lazy Loading por rutas
- Arquitectura basada en módulos funcionales
- Separación clara entre domain, application, infrastructure y presentation
- Buenas prácticas de seguridad frontend
- Código limpio, mantenible y escalable

## Reglas generales de desarrollo

1. Usa Angular 20 con componentes standalone.
2. Usa una arquitectura limpia y escalable.
3. No mezcles lógica de negocio dentro de los componentes.
4. Los componentes deben ser principalmente presentacionales.
5. Usa servicios, casos de uso o facades para la lógica de aplicación.
6. Usa interfaces fuertemente tipadas.
7. Usa formularios reactivos para todos los formularios.
8. Usa Angular Material para UI base.
9. Usa SCSS para estilos.
10. La aplicación debe ser completamente responsiva para móvil, tablet y desktop.
11. Implementa lazy loading por cada módulo principal.
12. Usa guards para proteger rutas administrativas.
13. Usa interceptors para manejo de tokens, errores y loading global.
14. Usa buenas prácticas de accesibilidad.
15. Usa nombres de carpetas, archivos, clases, interfaces y componentes en inglés.
16. El código debe estar en inglés.
17. No uses comentarios innecesarios.
18. Mantén el código listo para producción.
19. Incluye manejo de estados de carga, error y vacío en las pantallas principales.
20. Incluye componentes reutilizables para cards, formularios, galerías, ratings, botones, dialogs y tablas.

## Corrección importante de dominio

Aunque el usuario puede escribir "chacha" por error, en el código, textos y modelo de dominio se debe usar siempre "court" en inglés y "cancha" en español para la interfaz visible al usuario.

## Módulos principales

La aplicación debe tener 2 módulos principales:

1. Client Module
2. Admin Module

También debe tener un Core Module lógico, un Shared Module lógico y una capa de infraestructura.

---

# 1. Client Module

Este módulo es para los usuarios finales que desean buscar y reservar canchas.

## Funcionalidades del cliente

### 1.1 Home / Landing Page

Crear una página inicial moderna, limpia y responsiva que incluya:

- Hero section
- Buscador de canchas por ubicación
- Filtros rápidos
- Canchas destacadas
- Promociones activas
- Botón principal para buscar canchas
- Diseño mobile first

### 1.2 Buscar canchas disponibles

Crear una pantalla donde el cliente pueda buscar canchas disponibles en su zona.

Debe incluir:

- Búsqueda por ciudad o zona
- Filtro por fecha
- Filtro por hora
- Filtro por tipo de cancha
- Filtro por precio
- Filtro por calificación
- Filtro por promociones disponibles
- Listado de canchas disponibles
- Vista en cards responsivas
- Estado de carga
- Estado sin resultados
- Estado de error

Cada card de cancha debe mostrar:

- Foto principal
- Nombre de la cancha
- Ubicación
- Precio por hora
- Calificación promedio
- Número de comentarios
- Disponibilidad
- Botón para ver detalles
- Badge de promoción si aplica

### 1.3 Detalle de cancha

Crear una pantalla de detalle de cancha.

Debe incluir:

- Galería de fotos
- Nombre de la cancha
- Dirección
- Descripción
- Tipo de cancha
- Precio por hora
- Horarios disponibles
- Promociones activas
- Calificación promedio
- Lista de comentarios
- Formulario para comentar
- Formulario para calificar
- Botón para reservar
- Mapa placeholder o componente preparado para mapa futuro
- Diseño responsivo

### 1.4 Comentarios y calificaciones

El cliente debe poder:

- Ver comentarios de otros usuarios
- Crear un comentario
- Dar una calificación de 1 a 5 estrellas
- Ver el promedio de calificaciones
- Ver fecha del comentario
- Ver nombre del usuario que comentó

Validaciones:

- El comentario es requerido
- La calificación es requerida
- La calificación debe estar entre 1 y 5
- El comentario debe tener mínimo 10 caracteres
- El comentario debe tener máximo 500 caracteres

### 1.5 Reserva de cancha

Crear flujo de reserva.

Debe incluir:

- Selección de fecha
- Selección de hora inicial
- Selección de duración
- Cálculo automático del precio
- Aplicación de descuento o promoción si existe
- Resumen de reserva
- Confirmación antes de pagar

Modelo de reserva:

- id
- courtId
- userId
- date
- startTime
- endTime
- duration
- pricePerHour
- discountAmount
- totalAmount
- paymentStatus
- bookingStatus
- createdAt

Estados de reserva:

- pending
- confirmed
- cancelled
- completed

Estados de pago:

- pending
- paid
- failed
- refunded

### 1.6 Pago en línea

Crear una integración preparada para pasarela de pago.

No implementar una pasarela real todavía, pero dejar la arquitectura lista para integrar proveedores como:

- Mercado Pago
- PayU
- Stripe
- Wompi

Debe existir una abstracción llamada PaymentGateway.

Debe incluir:

- Pantalla de checkout
- Resumen del pago
- Botón de pagar
- Simulación de pago exitoso
- Simulación de pago fallido
- Manejo de estado pending
- Manejo de errores
- Redirección a pantalla de confirmación

Crear interfaz:

```ts
export interface PaymentGateway {
  createPayment(request: CreatePaymentRequest): Observable<PaymentTransaction>;
  confirmPayment(transactionId: string): Observable<PaymentTransaction>;
}
 