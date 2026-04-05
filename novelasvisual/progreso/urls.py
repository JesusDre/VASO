# URLs de la app progreso
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgresoUsuarioViewSet

# Registramos el ViewSet en el router
router = DefaultRouter()
router.register(r'progresos', ProgresoUsuarioViewSet, basename='progreso')

urlpatterns = [
    path('api/', include(router.urls)),
]