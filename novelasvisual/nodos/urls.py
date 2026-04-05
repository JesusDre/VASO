# URLs de la app nodos
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NodoViewSet, OpcionViewSet

# Registramos los ViewSets en el router
router = DefaultRouter()
router.register(r'nodos', NodoViewSet, basename='nodo')
router.register(r'opciones', OpcionViewSet, basename='opcion')

urlpatterns = [
    path('api/', include(router.urls)),
]