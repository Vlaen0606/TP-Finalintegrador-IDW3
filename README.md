# Veterinaria La Mary — Trabajo Final Integrador

**Materia:** Introducción al Desarrollo Web — 2do cuatrimestre 2026
**Tecnicatura Universitaria en Desarrollo Web — Facultad de Ciencias de la Administración, UNER**

## Integrantes del grupo

**Grupo 19**

- Francisconi, Gonzalo
- Serrano, Valentin
- Tonelli, Sofia Macarena

## Descripción

Sitio web para la clínica veterinaria "La Mary", con las páginas del rol **Visitante** y, desde la 3ra etapa, las páginas de administración de **Mascotas** y **Veterinarios**:

- `index.html` — Portada, con el listado de profesionales disponibles (foto/avatar, nombre, especialidad
  y valor de consulta), presentado en tarjetas de Bootstrap con modal de perfil ampliado.
- `institucional.html` — Información institucional (historia, valores, horarios de atención).
- `contacto.html` — Contacto (dirección, teléfono, email, horarios) y formulario de contacto.
- `mascotas.html` — ABM de mascotas (formulario + tabla), datos en LocalStorage.
- `veterinarios.html` — ABM de veterinarios (formulario + tabla), datos en LocalStorage.

## 1era Etapa — Maquetado (HTML + CSS + Vite)

Estructura estática de las 3 páginas, con menú de navegación y pie de página comunes, enlaces
relativos entre ellas, y estilo propio ("ficha de historia clínica": pestañas de carpeta en la
navegación, tarjetas con esquina doblada, tipografía Fraunces + Work Sans).

## 2da Etapa — RWD + Bootstrap 5

Sobre esa base se sumó:

- **Bootstrap 5.3** vía CDN (jsDelivr) — `bootstrap.min.css` en el `<head>` (cargado **antes** de
  `css/style.css`, que es el que redefine botones, badges, alerts, navbar y formularios con la
  paleta propia) y `bootstrap.bundle.min.js` antes de cerrar `<body>` (necesario para el menú
  colapsable y los modales).
- **Navbar responsiva** (`navbar navbar-expand-lg`) con botón hamburguesa (`navbar-toggler`) que
  colapsa el menú por debajo del breakpoint `lg` (992px), acceso a todas las páginas del sitio y estado
  `active`/`aria-current` en la página actual.
- **Sistema de grillas de Bootstrap** (`row` / `col`) en: la portada del catálogo de profesionales
  (`row-cols-1 row-cols-sm-2 row-cols-lg-3`), el hero, la sección "Cómo trabajamos"
  (`row-cols-1 row-cols-md-3`), la página institucional y la de contacto.
- **Cards de Bootstrap** para cada profesional, con avatar de iniciales (no usamos fotos de stock
  de personas reales para no atribuir un rostro a alguien inexistente), nombre, badge de
  especialidad y botón que abre un **modal** con el detalle completo y el valor de consulta.
- **Formulario de contacto** (`row g-3`, `form-control`, `form-select`) con validación nativa +
  clases de validación de Bootstrap (`novalidate` / `was-validated`) y un **modal** de confirmación
  de envío (el envío es una simulación: todavía no hay backend — eso llega en una etapa posterior).
- **Alerts** de Bootstrap: una nota informativa en institucional (recordatorio de libreta sanitaria)
  y otra en contacto (aviso de que el formulario aún no está conectado a la API).
- **Modo oscuro (opcional)** con un botón en el navbar que alterna `data-bs-theme="dark"` en el
  `<html>`, controlado por `js/main.js` y persistido en `localStorage`. Tanto las variables propias
  (`--bg`, `--ink`, `--heading`, etc.) como las de Bootstrap (`--bs-body-bg`, `--bs-body-color`, etc.)
  están redefinidas para el tema oscuro en `css/style.css`.

### Puntos de quiebre (RWD) contemplados

- `< 576px` (xs): una columna en todas las grillas, menú colapsado.
- `≥ 576px` (sm): catálogo de profesionales pasa a 2 columnas.
- `≥ 768px` (md): layouts de dos columnas (historia institucional, contacto) se abren en 2 columnas.
- `≥ 992px` (lg): catálogo de profesionales a 3 columnas, navbar se expande (sin hamburguesa).
- Media queries propias en `860px` y `640px` para ajustes finos del pie de página y espaciados.

## 3ra Etapa — Administración con LocalStorage

Se agregaron dos páginas de gestión (enlazadas desde la barra de navegación y el pie de página),
con formularios y tablas de Bootstrap 5 (`form-control`, `form-select`, `table table-striped
table-hover`, `table-responsive`, modal de confirmación) y todo el JavaScript en archivos externos.

| Archivo | Responsabilidad |
|---|---|
| `js/storage.js` | Módulo compartido: lectura/escritura en LocalStorage, generador de `uid`, formato de moneda, lista de especializaciones. |
| `js/mascotas.js` | Alta, listado, edición y baja de mascotas. |
| `js/veterinarios.js` | Alta, listado, edición y baja de veterinarios. |
| `js/catalogo.js` | Arma el catálogo de profesionales de la portada a partir de los veterinarios guardados. |

**Claves de LocalStorage** (una por entidad, cada una guarda un array JSON):

- `vlm-mascotas` → `{ idMascota, nombreMascota, nombreDuenio, color, edad, peso, imagen? }`
- `vlm-veterinarios` → `{ idVeterinario, matricula, nombre, especializacion, valorConsulta, imagen? }`

**Decisiones de implementación**

- El **id** (`uid`) se genera automáticamente al dar de alta (`crypto.randomUUID()`, con un respaldo
  para contextos no seguros). No hay campo de id en el formulario y se conserva al editar.
- **Tipos**: `edad` y `matricula` se guardan como enteros y `peso` y `valorConsulta` como decimales.
  Se convierten con `Number()` (no `parseInt`): un `<input type="number">` admite notación científica
  (`1e5`) y `parseInt` la leería mal como `1`. Los atributos `step="1"` / `step="0.01"` del input
  garantizan que el valor sea entero o decimal según corresponda.
- **Validación** con las clases de Bootstrap (`novalidate` + `was-validated`). Los campos de texto
  se validan sobre el valor ya recortado (`trim`), porque `required` y `minlength` del HTML cuentan
  los espacios y dejarían pasar un nombre como `"   "`. En veterinarios, además, no se permite
  repetir la matrícula (máximo 8 dígitos).
- **Editar**: el botón carga la fila en el mismo formulario (el título y el botón cambian a
  "Editar…" / "Guardar cambios", y aparece "Cancelar edición").
- **Eliminar**: abre un modal de Bootstrap pidiendo confirmación antes de borrar.
- La tabla y el contador ("N mascotas") se vuelven a dibujar tras cada alta, edición o baja, y
  se cargan desde LocalStorage al abrir la página.
- Todo texto ingresado por el usuario se escapa antes de insertarlo en el HTML (`escapeHtml`).

**Opcionales implementados**

- **Buscador en las tablas**: un campo de búsqueda sobre cada tabla filtra en vivo (sin distinguir
  mayúsculas ni tildes). En Mascotas busca por nombre, dueño y color; en Veterinarios, por nombre,
  matrícula y especialización. El contador pasa a "2 de 5 mascotas" mientras hay un filtro activo.
- **Mensajes de error con Bootstrap**: los errores de guardado o de imagen se muestran con un
  `alert alert-danger` dentro del formulario, en lugar de `alert()` del navegador.

- **Imagen de la mascota**: campo de archivo con vista previa; la foto se reduce a 240 px (canvas) y
  se guarda como data URL JPEG dentro del registro, para no agotar el límite de LocalStorage.
  Se muestra en la tabla (o las iniciales, si no tiene foto). Al editar se puede conservar,
  reemplazar o quitar.
- **Foto del veterinario**: mismo mecanismo que la mascota (campo de archivo, vista previa, reducción
  a 240 px y guardado como data URL en `vlm-veterinarios`). Se muestra en la tabla y en la tarjeta
  del catálogo de la portada; si el profesional no tiene foto, se usa el avatar con iniciales. La
  función `reducirImagen` quedó en `js/storage.js`, compartida por ambas páginas. Los 5 veterinarios de ejemplo
  traen su foto inicial (`js/fotos-iniciales.js`, indexadas por matrícula), que se carga junto con
  los datos la primera vez que se abre el sitio. Las fotos de nuevos profesionales las carga quien
  administra el sitio.
- **Catálogo dinámico de la portada**: las tarjetas, el modal "Ver perfil" y los contadores de la
  ficha de la clínica salen de `vlm-veterinarios`. La primera vez que se abre el sitio (cuando la
  clave todavía no existe) se cargan los 5 profesionales que antes estaban fijos en el HTML,
  con matrículas de ejemplo (4101–4105), para que la portada no quede vacía.
- **Especialización predefinida**: `<select>` con una lista fija (`ESPECIALIZACIONES` en
  `js/storage.js`); cada especialización tiene una descripción corta y una larga que usa la portada.

> Para volver al estado inicial, borrar las claves `vlm-mascotas` y `vlm-veterinarios` desde las
> herramientas de desarrollo del navegador (Application → Local Storage).

## Cómo correr el proyecto

1. Instalar las dependencias (Vite figura en `devDependencies`):
   ```bash
   npm install
   ```
2. Levantar el servidor de desarrollo:
   ```bash
   npx vite
   ```
3. Abrir la URL que informa la terminal (por defecto `http://localhost:5173`).

Para generar el build de producción (las 5 páginas quedan declaradas en `vite.config.js`):
```bash
npx vite build
```

## Estructura del proyecto

```
veterinaria-la-mary/
├── index.html
├── institucional.html
├── contacto.html
├── mascotas.html
├── veterinarios.html
├── css/
│   └── style.css
├── js/
│   ├── main.js          # modo oscuro + validación y modal del form de contacto
│   ├── storage.js       # LocalStorage, uid, formatos y especializaciones (compartido)
│   ├── fotos-iniciales.js # fotos de los 5 veterinarios de ejemplo (data URL)
│   ├── mascotas.js      # ABM de mascotas
│   ├── veterinarios.js  # ABM de veterinarios
│   └── catalogo.js      # catálogo dinámico de la portada
├── assets/
├── vite.config.js
├── package.json
└── README.md
```

## Próximas etapas

Esta entrega cubre el ABM de mascotas y veterinarios sobre LocalStorage (todo del lado del cliente).
El consumo de una API REST, los roles de Visitante/Administrador, los turnos y la historia clínica
se incorporarán en etapas posteriores.
