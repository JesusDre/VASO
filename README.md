# Novelas Visuales - Plataforma Fullstack

Proyecto completo para crear, leer y administrar novelas visuales interactivas. Incluye backend en Django REST Framework y frontend en React + Vite. Permite a creadores diseñar historias ramificadas, personajes, recursos multimedia y a los usuarios leer y guardar su progreso.

## Tabla de Contenidos
- [Novelas Visuales - Plataforma Fullstack](#novelas-visuales---plataforma-fullstack)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Descripción](#descripción)
  - [Tecnologías](#tecnologías)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Instalación](#instalación)
    - [Prerrequisitos](#prerrequisitos)
    - [1. Clona el repositorio](#1-clona-el-repositorio)
    - [2.1 (Recomendado) Crea un entorno virtual para el backend](#21-recomendado-crea-un-entorno-virtual-para-el-backend)
    - [2.2 Instala dependencias del backend](#22-instala-dependencias-del-backend)
    - [3. Instala dependencias del frontend](#3-instala-dependencias-del-frontend)
  - [Configuración de la base de datos](#configuración-de-la-base-de-datos)
  - [Cómo correr el proyecto](#cómo-correr-el-proyecto)
    - [1. Aplica migraciones y carga datos iniciales](#1-aplica-migraciones-y-carga-datos-iniciales)
    - [2. Inicia el backend](#2-inicia-el-backend)
    - [3. Inicia el frontend](#3-inicia-el-frontend)
  - [Notas y recomendaciones](#notas-y-recomendaciones)

---

## Descripción
Esta plataforma permite crear y consumir novelas visuales tipo "elige tu propia aventura". Los administradores y creadores pueden:
- Crear historias con múltiples rutas y finales.
- Administrar personajes, imágenes y audios.
- Controlar el progreso de los lectores.
- Registrar y autenticar usuarios con roles personalizados.

Los lectores pueden:
- Leer historias interactivas.
- Guardar su progreso y continuar después.

## Tecnologías
- **Backend:** Django 4.2, Django REST Framework, JWT, MySQL
- **Frontend:** React 19, Vite, Bootstrap
- **Otros:** Pillow, python-decouple, CORS, ESLint

## Estructura del Proyecto
```
novelasvisual/        # Backend Django
    core/            # Vistas y utilidades generales
    usuarios/        # Usuarios y roles personalizados
    recursos/        # Imágenes y audios
    historias/       # Historias principales
    nodos/           # Escenas y opciones de la historia
    personajes/      # Personajes y sus relaciones
    progreso/        # Progreso de usuarios en historias
    media/           # Archivos multimedia
    static/          # Archivos estáticos
    templates/       # Plantillas HTML
front/               # Frontend React + Vite
    src/             # Componentes, páginas y servicios
```

## Instalación
### Prerrequisitos
- Python 3.11+
- Node.js 18+
- MySQL 8+
- Git

### 1. Clona el repositorio
```bash
git clone <URL-del-repo>
cd nombre_carpeta
```

### 2.1 (Recomendado) Crea un entorno virtual para el backend
```bash
cd novelasvisual
python -m venv venv
# Activa el entorno virtual:
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
# source venv/bin/activate
```

### 2.2 Instala dependencias del backend
```bash
pip install -r requirements.txt
```

> El archivo `requirements.txt` instala:

> - asgiref==3.11.1
> - Django==4.2.16
> - django-cors-headers==4.4.0
> - djangorestframework==3.15.2
> - djangorestframework-simplejwt==5.3.1
> - mysql==0.0.3
> - mysqlclient==2.2.8
> - pillow==10.4.0
> - PyJWT==2.12.1
> - PyMySQL==1.1.2
> - python-decouple==3.8
> - sqlparse==0.5.5
> - tzdata==2025.3

### 3. Instala dependencias del frontend
```bash
cd ../front
npm install
```

## Configuración de la base de datos
1. Crea la base de datos en MySQL:
```sql
CREATE DATABASE novelasvisual_db;
```
2. Crea un archivo `.env` en la raíz de `novelasvisual/` con:
```
SECRET_KEY=tu-clave-secreta
DEBUG=True
DB_NAME=novelasvisual_db
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=3306
```

## Cómo correr el proyecto
### 1. Aplica migraciones y carga datos iniciales
```bash
cd novelasvisual
python manage.py makemigrations
python manage.py migrate
python manage.py loaddata usuarios/fixtures/roles_iniciales.json
```

### 2. Inicia el backend
```bash
python manage.py runserver
```

### 3. Inicia el frontend
```bash
cd ../front
npm run dev
```

- El backend estará en: http://localhost:8000
- El frontend en: http://localhost:5173

## Notas y recomendaciones
- El archivo `.env` **no debe subirse a git**.
- Para producción, configura correctamente las variables de entorno y desactiva DEBUG.
- Puedes personalizar los roles y permisos en la app `usuarios`.
- La base de datos usa modelos relacionales para historias, nodos, personajes y progreso.
- Los recursos multimedia se almacenan en la carpeta `media/`.

---

¡Listo! Ahora puedes crear, editar y leer novelas visuales interactivas.