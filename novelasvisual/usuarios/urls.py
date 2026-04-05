# URLs de la app usuarios
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RolViewSet, UsuarioViewSet

# Registramos los ViewSets en el router
router = DefaultRouter()
router.register(r'roles', RolViewSet, basename='rol')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    # Todas las rutas generadas quedan bajo el prefijo api/
    path('api/', include(router.urls)),
]