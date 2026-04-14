# Cambios: Sistema de Categorías + Contador de Visitas

## Archivos NUEVOS

### Backend
- `novelasvisual/historias/migrations/0002_categoria_historia_categoria.py`
  Migración que crea la tabla `Categoria` y agrega la columna `categoria_id` a `Historia`.

### Frontend
- `front/src/modules/admin/AdminPanel/components/TabCategorias.jsx`
  Tab del panel de administración para gestionar categorías (crear, editar, desactivar/delete lógico).

---

## Archivos MODIFICADOS

### Backend
- `novelasvisual/historias/models.py`
  Se agregó el modelo `Categoria` y el campo FK `categoria` al modelo `Historia`.

- `novelasvisual/historias/serializers.py`
  Se agregó `CategoriaSerializer` y se actualizó `HistoriaSerializer` para incluir los campos `categoria` y `nombre_categoria`.

- `novelasvisual/historias/views.py`
  Se agregó el permiso `IsAdminOrReadOnly`, el `CategoriaViewSet` y se actualizó `HistoriaViewSet` para soportar filtrado por `?categoria=<id>`.

- `novelasvisual/historias/urls.py`
  Se registró la ruta `/api/categorias/` con el router.

### Frontend
- `front/src/services/api.js`
  Se agregaron las funciones `readCategorias`, `createCategoria` y `updateCategoria`.

- `front/src/modules/admin/AdminPanel/index.jsx`
  Se agregó el tab "Categorías" y se importó `TabCategorias`.

- `front/src/modules/creador/EditorHistoria/components/TabInfo.jsx`
  Se conectó el `<select>` de categoría a la API (antes estaba hardcodeado). Ahora carga las categorías activas y guarda el valor seleccionado junto con la historia.

- `front/src/components/HistoriaCard.jsx`
  El badge de categoría ahora muestra `historia.nombre_categoria` en lugar del texto fijo "Novela Visual".

- `front/src/modules/public/Home/hooks/useHistorias.jsx`
  Se agregó el estado `categoria` / `setCategoria` y se carga la lista de categorías desde la API para poder filtrar.

- `front/src/modules/public/Home/index.jsx`
  Se agregaron botones de filtro por categoría debajo del buscador.

- `front/src/modules/public/Home/Home.css`
  Se agregaron los estilos `.nv-cat-btn` y `.nv-cat-btn.active` para los botones de filtro.

- `front/src/modules/public/DetalleHistoria/index.jsx`
  El badge muestra la categoría real de la historia en lugar del texto fijo "Misterio".

---

# Cambios: Contador de Visitas

## Archivos NUEVOS

### Backend
- `novelasvisual/core/migrations/0001_initial.py`
  Migración que crea la tabla `ContadorVisitas`.

- `novelasvisual/core/urls.py`
  Ruta `GET/POST /api/visitas/`.

### Frontend
- `front/.env`
  Variable `VITE_VISITA_SEGUNDOS=60` para configurar el tiempo antes de contar una visita.

- `front/src/hooks/useContadorVisitas.js`
  Hook que obtiene el total de visitas y dispara el registro después de X segundos. Usa `sessionStorage` para no contar recargas.

---

## Archivos MODIFICADOS

### Backend
- `novelasvisual/core/models.py`
  Se agregó el modelo `ContadorVisitas` (singleton, un solo registro).

- `novelasvisual/core/views.py`
  Se agregó `VisitasView` (GET devuelve total, POST incrementa).

- `novelasvisual/novelasvisual/urls.py`
  Se incluyó `core.urls`.

### Frontend
- `front/src/services/api.js`
  Se agregaron `readVisitas` y `registrarVisita`.

- `front/src/components/Navbar.jsx`
  Se importó el hook y se muestra el contador discretamente junto al logo.

- `front/src/styles/navbar.css`
  Se agregó el estilo `.nv-visit-counter`.

---

---

# Cambios: Bitácora de Auditoría

## Archivos NUEVOS

### Backend (nueva app `auditoria`)
- `novelasvisual/auditoria/__init__.py`
- `novelasvisual/auditoria/apps.py` — AppConfig que conecta las signals en `ready()`
- `novelasvisual/auditoria/models.py` — modelo `BitacoraMovimiento`
- `novelasvisual/auditoria/middleware.py` — captura IP y usuario del request por hilo
- `novelasvisual/auditoria/signals.py` — signals `pre_save`, `post_save`, `post_delete` para Historia, Categoria, MiUsuario, Nodo
- `novelasvisual/auditoria/serializers.py` — serializer de solo lectura
- `novelasvisual/auditoria/views.py` — `ReadOnlyModelViewSet` con `IsAdminUser` y filtros
- `novelasvisual/auditoria/urls.py` — ruta `/api/bitacora/`
- `novelasvisual/auditoria/migrations/__init__.py`
- `novelasvisual/auditoria/migrations/0001_initial.py`

### Frontend
- `front/src/modules/admin/AdminPanel/components/TabBitacora.jsx` — vista de solo lectura con filtros por tabla, tipo de movimiento y fechas. Cada fila es expandible para ver `valor_anterior` y `valor_nuevo`.

## Archivos MODIFICADOS

### Backend
- `novelasvisual/novelasvisual/settings.py` — se agregó `auditoria` a `INSTALLED_APPS` y `AuditoriaMiddleware` a `MIDDLEWARE`
- `novelasvisual/novelasvisual/urls.py` — se incluyó `auditoria.urls`

### Frontend
- `front/src/services/api.js` — se agregó `readBitacora`
- `front/src/modules/admin/AdminPanel/index.jsx` — se agregó tab "Bitácora"

---

## Pasos para activar

1. Aplicar las migraciones:
   ```bash
   python manage.py migrate
   ```
2. El admin debe tener `is_staff = True` en Django para poder crear/editar categorías y consultar la bitácora.
3. Para cambiar el tiempo de conteo de visitas, editar `front/.env` y modificar `VITE_VISITA_SEGUNDOS`.
