# URLs de la app recursos
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ImagenViewSet, AudioViewSet

# Registramos los ViewSets en el router
router = DefaultRouter()
router.register(r'imagenes', ImagenViewSet, basename='imagen')
router.register(r'audios', AudioViewSet, basename='audio')

urlpatterns = [
    path('api/', include(router.urls)),
]