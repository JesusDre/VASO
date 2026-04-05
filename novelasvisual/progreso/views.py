# Vistas de la app progreso
# El ViewSet filtra los progresos por el usuario autenticado actual
from rest_framework import viewsets
from .models import ProgresoUsuario
from .serializers import ProgresoUsuarioSerializer


# -----------------------------------------------------------
# ViewSet de ProgresoUsuario
# Solo devuelve los progresos del usuario que hace la peticion
# -----------------------------------------------------------
class ProgresoUsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = ProgresoUsuarioSerializer

    def get_queryset(self):
        # Filtramos para que cada usuario solo vea su propio progreso
        return ProgresoUsuario.objects.filter(id_usuario=self.request.user)