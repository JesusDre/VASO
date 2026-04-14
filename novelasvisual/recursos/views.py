# Vistas de la app recursos
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Imagen, Audio
from .serializers import ImagenSerializer, AudioSerializer


# -----------------------------------------------------------
# ViewSet de Imagen: CRUD filtrado por usuario autenticado
# -----------------------------------------------------------
class ImagenViewSet(viewsets.ModelViewSet):
    serializer_class = ImagenSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Imagen.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class AudioViewSet(viewsets.ModelViewSet):
    serializer_class = AudioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Audio.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
