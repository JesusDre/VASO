# Vistas de la app nodos
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Nodo, Opcion
from .serializers import NodoSerializer, OpcionSerializer


# -----------------------------------------------------------
# ViewSet de Nodo: lectura publica, escritura requiere auth
# -----------------------------------------------------------
class NodoViewSet(viewsets.ModelViewSet):
    queryset = Nodo.objects.all()
    serializer_class = NodoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# -----------------------------------------------------------
# ViewSet de Opcion: lectura publica, escritura requiere auth
# -----------------------------------------------------------
class OpcionViewSet(viewsets.ModelViewSet):
    queryset = Opcion.objects.all()
    serializer_class = OpcionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]