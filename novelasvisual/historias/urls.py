# URLs de la app historias
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HistoriaViewSet

# Registramos el ViewSet en el router
router = DefaultRouter()
router.register(r'historias', HistoriaViewSet, basename='historia')

urlpatterns = [
    path('api/', include(router.urls)),
]