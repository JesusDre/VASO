# URLs de la app historias
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HistoriaViewSet, CategoriaViewSet

# Registramos los ViewSets en el router
router = DefaultRouter()
router.register(r'historias',  HistoriaViewSet,  basename='historia')
router.register(r'categorias', CategoriaViewSet, basename='categoria')

urlpatterns = [
    path('api/', include(router.urls)),
]