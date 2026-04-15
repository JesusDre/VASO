# Vistas de la app progreso
# El ViewSet filtra los progresos por el usuario autenticado actual
from rest_framework import viewsets
from loguru import logger
from .models import ProgresoUsuario
from .serializers import ProgresoUsuarioSerializer


# -----------------------------------------------------------
# ViewSet de ProgresoUsuario
# Solo devuelve los progresos del usuario que hace la peticion
# -----------------------------------------------------------
class ProgresoUsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = ProgresoUsuarioSerializer

    def get_queryset(self):
        return ProgresoUsuario.objects.filter(id_usuario=self.request.user)

    def perform_create(self, serializer):
        progreso = serializer.save()
        logger.info("Progreso iniciado | id={} user={}", progreso.id, self.request.user.id)

    def perform_update(self, serializer):
        progreso = serializer.save()
        logger.info("Progreso actualizado | id={} user={}", progreso.id, self.request.user.id)

    def perform_destroy(self, instance):
        logger.warning("Progreso eliminado | id={} user={}", instance.id, self.request.user.id)
        instance.delete()