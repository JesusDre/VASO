# Vistas de la app personajes
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Personaje, NodoPersonaje
from .serializers import PersonajeSerializer, NodoPersonajeSerializer


# -----------------------------------------------------------
# ViewSet de Personaje: CRUD completo
# -----------------------------------------------------------
class PersonajeViewSet(viewsets.ModelViewSet):
    queryset = Personaje.objects.all()
    serializer_class = PersonajeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class NodoPersonajeViewSet(viewsets.ModelViewSet):
    queryset = NodoPersonaje.objects.all()
    serializer_class = NodoPersonajeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]