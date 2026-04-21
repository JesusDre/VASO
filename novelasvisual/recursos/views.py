# Vistas de la app recursos
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from loguru import logger
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
        imagen = serializer.save(usuario=self.request.user)
        logger.info(
            "Imagen creada (public endpoint) | id={} tipo='{}' user={}",
            imagen.id, getattr(imagen, "tipo", None), getattr(self.request.user, "id", None)
        )

    def perform_destroy(self, instance):
        logger.warning(
            "Imagen eliminada (public endpoint) | id={} tipo='{}' user={}",
            instance.id, getattr(instance, "tipo", None), getattr(self.request.user, "id", None)
        )
        instance.delete()


class AudioViewSet(viewsets.ModelViewSet):
    serializer_class   = AudioSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Audio.objects.all()

    def perform_create(self, serializer):
        audio = serializer.save(usuario=self.request.user)
        logger.info(
            "Audio creado (public endpoint) | id={} user={}",
            audio.id, getattr(self.request.user, "id", None)
        )

    def perform_destroy(self, instance):
        logger.warning(
            "Audio eliminado (public endpoint) | id={} user={}",
            instance.id, getattr(self.request.user, "id", None)
        )
        instance.delete()


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
        imagen = serializer.save(usuario=self.request.user)
        logger.info(
            "Imagen creada (privado) | id={} tipo='{}' user={}",
            imagen.id, getattr(imagen, "tipo", None), self.request.user.id
        )

    def perform_destroy(self, instance):
        logger.warning(
            "Imagen eliminada (privado) | id={} tipo='{}' user={}",
            instance.id, getattr(instance, "tipo", None), self.request.user.id
        )
        instance.delete()


class MisAudiosViewSet(viewsets.ModelViewSet):
    serializer_class   = AudioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Audio.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        logger.info("FILES recibidos: {}", dict(self.request.FILES))
        logger.info("DATA recibida: {}", dict(self.request.data))
        audio = serializer.save(usuario=self.request.user)
        logger.info(
            "Audio creado (privado) | id={} user={}",
            audio.id, self.request.user.id
        )

    def perform_destroy(self, instance):
        logger.warning(
            "Audio eliminado (privado) | id={} user={}",
            instance.id, self.request.user.id
        )
        instance.delete()