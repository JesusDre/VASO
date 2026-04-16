# Configuracion principal del proyecto Novelas Visuales
# Utiliza python-decouple para leer variables del archivo .env

from decouple import config, Csv
from datetime import timedelta
from pathlib import Path
from loguru import logger
import logging.config
import os

# Ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# -----------------------------------------------------------
# Seguridad
# -----------------------------------------------------------
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# -----------------------------------------------------------
# Aplicaciones instaladas
# -----------------------------------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Librerias de terceros
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt.token_blacklist',
    # Apps del proyecto
    'core',
    'usuarios',
    'recursos',
    'historias',
    'nodos',
    'personajes',
    'progreso',
    'auditoria',
]

# -----------------------------------------------------------
# Middleware
# -----------------------------------------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # Captura IP y usuario del request para la bitácora de auditoría
    'auditoria.middleware.AuditoriaMiddleware',
]

ROOT_URLCONF = 'novelasvisual.urls'

# -----------------------------------------------------------
# Templates
# -----------------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'novelasvisual.wsgi.application'

# -----------------------------------------------------------
# Base de datos MySQL
# -----------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
    }
}

# -----------------------------------------------------------
# Validaciones de contrasena
# -----------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# -----------------------------------------------------------
# Internacionalizacion
# -----------------------------------------------------------
LANGUAGE_CODE = 'es-mx'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# -----------------------------------------------------------
# Archivos estaticos y de medios
# -----------------------------------------------------------
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'   # para collectstatic en produccion

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# -----------------------------------------------------------
# Clave primaria por defecto
# -----------------------------------------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# -----------------------------------------------------------
# CORS: permite peticiones desde el frontend en Vite
# -----------------------------------------------------------
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='https://localhost:5173,http://127.0.0.1:5173',
    cast=Csv(),
)

# -----------------------------------------------------------
# Seguridad adicional (solo activa en produccion, DEBUG=False)
# -----------------------------------------------------------
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='https://app.genidas.com',
    cast=Csv(),
)

if not DEBUG:
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000          # 1 año
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

# -----------------------------------------------------------
# Django REST Framework: JWT global por defecto
# -----------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# -----------------------------------------------------------
# SimpleJWT: configuracion de tokens
# -----------------------------------------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),   # 1 hora
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# -----------------------------------------------------------
# Modelo de usuario personalizado
# -----------------------------------------------------------
AUTH_USER_MODEL = 'usuarios.MiUsuario'

# -----------------------------------------------------------
# Logging con Loguru
# -----------------------------------------------------------
LOGGING_CONFIG = None  # Desactiva la configuracion automatica de Django

LOG_DIR = BASE_DIR / 'logs'
LOG_DIR.mkdir(exist_ok=True)

_FMT = "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}"

logger.configure(handlers=[
    {
        'sink': LOG_DIR / 'debug.log',
        'level': 'DEBUG',
        'filter': lambda record: record['level'].no <= logger.level('WARNING').no,
        'format': _FMT,
        'rotation': '10 MB',
        'retention': '2 days',
        'compression': 'zip',
    },
    {
        'sink': LOG_DIR / 'error.log',
        'level': 'ERROR',
        'format': _FMT,
        'rotation': '10 MB',
        'retention': '2 days',
        'compression': 'zip',
        'backtrace': True,
        'diagnose': True,
    },
])

# Registra el InterceptorHandler manualmente ya que LOGGING_CONFIG = None
# hace que Django ignore el dict LOGGING sin esta llamada explicita
_LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'loguru': {
            'class': 'novelasvisual.interceptor.InterceptorHandler',
        },
    },
    'root': {
        'handlers': ['loguru'],
        'level': 'DEBUG',
    },
}
logging.config.dictConfig(_LOGGING)