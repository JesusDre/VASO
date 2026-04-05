# URLs de la app personajes
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonajeViewSet, NodoPersonajeViewSet

# Registramos los ViewSets en el router
router = DefaultRouter()
router.register(r'personajes', PersonajeViewSet, basename='personaje')
router.register(r'nodo-personajes', NodoPersonajeViewSet, basename='nodo-personaje')

urlpatterns = [
    path('api/', include(router.urls)),
]