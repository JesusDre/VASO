# URL raiz del proyecto Novelas Visuales
# Incluye las rutas de todas las apps y los endpoints de JWT

from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core import views as core_views
from usuarios.views import RegistroView

urlpatterns = [
    # Vista de inicio (renderiza template HTML principal)
    path('', core_views.index, name='index'),

    # Endpoint para iniciar sesion: recibe email y password, devuelve access y refresh tokens
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Endpoint para refrescar el access token usando el refresh token
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Endpoint de registro publico (AllowAny)
    path('api/registro/', RegistroView.as_view(), name='registro'),

    # Rutas de cada app del proyecto
    path('', include('usuarios.urls')),
    path('', include('recursos.urls')),
    path('', include('historias.urls')),
    path('', include('nodos.urls')),
    path('', include('personajes.urls')),
    path('', include('progreso.urls')),
]

# Servir archivos de medios en modo DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)