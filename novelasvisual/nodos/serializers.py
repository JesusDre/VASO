# Serializadores de la app nodos
from rest_framework import serializers
from .models import Nodo, Opcion


# -----------------------------------------------------------
# Serializador de Nodo
# -----------------------------------------------------------
class NodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nodo
        fields = [
            'id',
            'titulo_nodo',
            'texto',
            'es_final',
            'id_historia',
            'id_imagen_escenario',
            'id_audio_fondo',
        ]


# -----------------------------------------------------------
# Serializador de Opcion
# -----------------------------------------------------------
class OpcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opcion
        fields = [
            'id',
            'texto_opcion',
            'id_nodo_origen',
            'id_nodo_destino',
        ]