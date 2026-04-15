# Vistas de la app nodos
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from loguru import logger
from .models import Nodo, Opcion
from .serializers import NodoSerializer, OpcionSerializer


# -----------------------------------------------------------
# ViewSet de Nodo: lectura publica, escritura requiere auth
# -----------------------------------------------------------
class NodoViewSet(viewsets.ModelViewSet):
    queryset = Nodo.objects.all()
    serializer_class = NodoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        nodo = serializer.save()
        logger.info("Nodo creado | id={} user={}", nodo.id, self.request.user.id)

    def perform_update(self, serializer):
        nodo = serializer.save()
        logger.info("Nodo actualizado | id={} user={}", nodo.id, self.request.user.id)

    def perform_destroy(self, instance):
        logger.warning("Nodo eliminado | id={} user={}", instance.id, self.request.user.id)
        instance.delete()


# -----------------------------------------------------------
# ViewSet de Opcion: lectura publica, escritura requiere auth
# -----------------------------------------------------------
class OpcionViewSet(viewsets.ModelViewSet):
    queryset = Opcion.objects.all()
    serializer_class = OpcionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        opcion = serializer.save()
        logger.info("Opcion creada | id={} user={}", opcion.id, self.request.user.id)

    def perform_update(self, serializer):
        opcion = serializer.save()
        logger.info("Opcion actualizada | id={} user={}", opcion.id, self.request.user.id)

    def perform_destroy(self, instance):
        logger.warning("Opcion eliminada | id={} user={}", instance.id, self.request.user.id)
        instance.delete()