# Cambios: Sistema de Categorías

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

## Pasos para activar

1. Aplicar la migración:
   ```bash
   python manage.py migrate
   ```
2. El admin debe tener `is_staff = True` en Django para poder crear/editar categorías desde la API.
