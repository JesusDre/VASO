# Serializadores para registro y consulta de usuarios
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Rol

# Obtiene dinamicamente el modelo MiUsuario gracias a AUTH_USER_MODEL en settings.py
User = get_user_model()


# -----------------------------------------------------------
# Serializador de Rol
# -----------------------------------------------------------
class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre_rol']


# -----------------------------------------------------------
# Serializador de registro de usuario
# La contrasena es write_only para que nunca se devuelva en respuestas
# -----------------------------------------------------------
class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'nombre',
            'apellido_paterno',
            'apellido_materno',
            'email',
            'password',
            'id_rol',
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Ignorar id_rol enviado por el cliente; asignar rol "creador" automaticamente
        validated_data.pop('id_rol', None)
        rol_creador = Rol.objects.filter(nombre_rol__icontains='creador').first()
        user = User.objects.create_user(**validated_data)
        if rol_creador:
            user.id_rol = rol_creador
            user.save(update_fields=['id_rol'])
        return user


# -----------------------------------------------------------
# Serializador de consulta de usuario (sin contrasena)
# -----------------------------------------------------------
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'nombre',
            'apellido_paterno',
            'apellido_materno',
            'email',
            'fecha_registro',
            'activo',
            'id_rol',
        ]