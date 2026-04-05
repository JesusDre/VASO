# Serializadores de la app progreso
from rest_framework import serializers
from .models import ProgresoUsuario


# -----------------------------------------------------------
# Serializador de ProgresoUsuario
# -----------------------------------------------------------
class ProgresoUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgresoUsuario
        fields = [
            'id',
            'id_usuario',
            'id_historia',
            'id_nodo_actual',
            'fecha_actualizacion',
        ]