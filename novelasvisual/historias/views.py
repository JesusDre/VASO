# Vistas de la app historias
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Historia
from .serializers import HistoriaSerializer


# -----------------------------------------------------------
# ViewSet de Historia: lectura publica, escritura requiere auth
# -----------------------------------------------------------
class HistoriaViewSet(viewsets.ModelViewSet):
    queryset = Historia.objects.all()
    serializer_class = HistoriaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]