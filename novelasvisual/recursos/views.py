# Vistas de la app recursos
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Imagen, Audio
from .serializers import ImagenSerializer, AudioSerializer


# -----------------------------------------------------------
# ViewSet de Imagen: CRUD filtrado por usuario autenticado
# -----------------------------------------------------------
class ImagenViewSet(viewsets.ModelViewSet):
    serializer_class = ImagenSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Imagen.objects.all()

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class AudioViewSet(viewsets.ModelViewSet):
    serializer_class = AudioSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Audio.objects.all()

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
