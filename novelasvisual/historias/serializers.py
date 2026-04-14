# Serializadores de la app historias
import base64
from rest_framework import serializers
from .models import Historia, Categoria


# -----------------------------------------------------------
# Serializador de Categoria
# -----------------------------------------------------------
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Categoria
        fields = ['id', 'nombre', 'descripcion', 'activa']


# -----------------------------------------------------------
# Serializador de Historia
# -----------------------------------------------------------
class HistoriaSerializer(serializers.ModelSerializer):
    # URL del archivo de portada (si se guardo como ImageField)
    portada_url = serializers.SerializerMethodField()
    # Imagen de portada en base64 (si se guardo como binario)
    portada_base64 = serializers.SerializerMethodField()
    # Nombre legible de la categoría (solo lectura)
    nombre_categoria = serializers.SerializerMethodField()

    class Meta:
        model = Historia
        fields = [
            'id',
            'titulo',
            'descripcion',
            'fecha_creacion',
            'publicada',
            'id_creador',
            'id_nodo_inicio',
            'id_portada',
            'categoria',
            'nombre_categoria',
            'portada_url',
            'portada_base64',
        ]

    def get_portada_url(self, obj):
        if obj.id_portada and obj.id_portada.url:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.id_portada.url.url)
            return obj.id_portada.url.url
        return None

    def get_portada_base64(self, obj):
        if obj.id_portada and obj.id_portada.imagen_binaria:
            return base64.b64encode(obj.id_portada.imagen_binaria).decode('utf-8')
        return None

    def get_nombre_categoria(self, obj):
        if obj.categoria:
            return obj.categoria.nombre
        return None