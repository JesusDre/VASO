from rest_framework import serializers
from .models import BitacoraMovimiento


class BitacoraMovimientoSerializer(serializers.ModelSerializer):
    usuario_email = serializers.SerializerMethodField()

    class Meta:
        model  = BitacoraMovimiento
        fields = [
            'id',
            'nombre_dato',
            'tipo_movimiento',
            'valor_anterior',
            'valor_nuevo',
            'fecha_hora',
            'host_origen',
            'usuario',
            'usuario_email',
        ]

    def get_usuario_email(self, obj):
        if obj.usuario:
            return obj.usuario.email
        return None
