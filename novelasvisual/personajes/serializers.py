# Serializadores de la app personajes
from rest_framework import serializers
from .models import Personaje, NodoPersonaje


# -----------------------------------------------------------
# Serializador de Personaje
# -----------------------------------------------------------
class PersonajeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personaje
        fields = [
            'id',
            'nombre',
            'id_historia',
            'id_imagen',
        ]


# -----------------------------------------------------------
# Serializador de NodoPersonaje (tabla pivote)
# -----------------------------------------------------------
class NodoPersonajeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NodoPersonaje
        fields = [
            'id',
            'id_nodo',
            'id_personaje',
            'posicion',
        ]