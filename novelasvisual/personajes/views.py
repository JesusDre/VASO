# Vistas de la app personajes
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from loguru import logger
from .models import Personaje, NodoPersonaje
from .serializers import PersonajeSerializer, NodoPersonajeSerializer


# -----------------------------------------------------------
# ViewSet de Personaje: CRUD completo
# -----------------------------------------------------------
class PersonajeViewSet(viewsets.ModelViewSet):
    queryset = Personaje.objects.all()
    serializer_class = PersonajeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        personaje = serializer.save()
        logger.info("Personaje creado | id={} user={}", personaje.id, self.request.user.id)

    def perform_update(self, serializer):
        personaje = serializer.save()
        logger.info("Personaje actualizado | id={} user={}", personaje.id, self.request.user.id)

    def perform_destroy(self, instance):
        logger.warning("Personaje eliminado | id={} user={}", instance.id, self.request.user.id)
        instance.delete()


class NodoPersonajeViewSet(viewsets.ModelViewSet):
    queryset = NodoPersonaje.objects.all()
    serializer_class = NodoPersonajeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        rel = serializer.save()
        logger.info("NodoPersonaje creado | id={} user={}", rel.id, self.request.user.id)

    def perform_destroy(self, instance):
        logger.warning("NodoPersonaje eliminado | id={} user={}", instance.id, self.request.user.id)
        instance.delete()