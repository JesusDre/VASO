# Vistas de la app recursos
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from loguru import logger
from .models import Imagen, Audio
from .serializers import ImagenSerializer, AudioSerializer


# -----------------------------------------------------------
# ViewSet de Imagen
# GET /api/imagenes/          -> solo las del usuario autenticado (biblioteca)
# GET /api/imagenes/publicas/ -> todas, sin auth (lector de novelas)
# POST/PUT/DELETE             -> requiere autenticacion
# -----------------------------------------------------------
class ImagenViewSet(viewsets.ModelViewSet):
    serializer_class = ImagenSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Imagen.objects.filter(usuario=self.request.user)
        return Imagen.objects.all()

    def perform_create(self, serializer):
        imagen = serializer.save(usuario=self.request.user)
        logger.info("Imagen subida | id={} tipo='{}' user={}", imagen.id, imagen.tipo, self.request.user.id)

    def perform_destroy(self, instance):
        logger.warning("Imagen eliminada | id={} tipo='{}' user={}", instance.id, instance.tipo, self.request.user.id)
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='publicas')
    def publicas(self, _request):
        imagenes = Imagen.objects.all()
        serializer = self.get_serializer(imagenes, many=True)
        return Response(serializer.data)


# -----------------------------------------------------------
# ViewSet de Audio
# GET /api/audios/          -> solo los del usuario autenticado (biblioteca)
# GET /api/audios/publicos/ -> todos, sin auth (lector de novelas)
# POST/PUT/DELETE           -> requiere autenticacion
# -----------------------------------------------------------
class AudioViewSet(viewsets.ModelViewSet):
    serializer_class = AudioSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Audio.objects.filter(usuario=self.request.user)
        return Audio.objects.all()

    def perform_create(self, serializer):
        audio = serializer.save(usuario=self.request.user)
        logger.info("Audio subido | id={} user={}", audio.id, self.request.user.id)

    def perform_destroy(self, instance):
        logger.warning("Audio eliminado | id={} user={}", instance.id, self.request.user.id)
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='publicos')
    def publicos(self, _request):
        audios = Audio.objects.all()
        serializer = self.get_serializer(audios, many=True)
        return Response(serializer.data)
