# Vistas de la app recursos
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Imagen, Audio
from .serializers import ImagenSerializer, AudioSerializer


# -----------------------------------------------------------
# ViewSet público: lectura de TODOS los recursos
# Usado por el lector de novelas y para mostrar portadas
# GET  /api/imagenes/  — todos (sin auth)
# POST /api/imagenes/  — requiere auth, guarda con usuario
# -----------------------------------------------------------
class ImagenViewSet(viewsets.ModelViewSet):
    serializer_class   = ImagenSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Imagen.objects.all()

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class AudioViewSet(viewsets.ModelViewSet):
    serializer_class   = AudioSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Audio.objects.all()

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


# -----------------------------------------------------------
# ViewSet privado: solo los recursos del usuario autenticado
# Usado por el editor y la biblioteca del creador
# GET /api/mis-imagenes/  — solo las del usuario (requiere auth)
# -----------------------------------------------------------
class MisImagenesViewSet(viewsets.ModelViewSet):
    serializer_class   = ImagenSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Imagen.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class MisAudiosViewSet(viewsets.ModelViewSet):
    serializer_class   = AudioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Audio.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
