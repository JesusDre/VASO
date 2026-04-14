# Serializadores de la app recursos
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Imagen, Audio

# Limites de tamaño permitidos
IMAGEN_MAX_BYTES = 5 * 1024 * 1024   # 5 MB
AUDIO_MAX_BYTES  = 10 * 1024 * 1024  # 10 MB


# -----------------------------------------------------------
# Serializador de Imagen con patron dual:
# - imagen_para_binario: recibe el archivo (write_only)
# - imagen_base64_display: devuelve la version base64 (read_only)
# -----------------------------------------------------------
class ImagenSerializer(serializers.ModelSerializer):
    # Campo para recibir el archivo que se guardara como binario en la BD
    imagen_para_binario = serializers.ImageField(write_only=True, required=False)

    # Campo calculado que expone la imagen binaria como cadena base64
    imagen_base64_display = serializers.ReadOnlyField(source='imagen_base64')

    class Meta:
        model = Imagen
        fields = [
            'id',
            'url',
            'imagen_para_binario',
            'imagen_base64_display',
            'tipo',
            'descripcion',
            'usuario',
        ]
        read_only_fields = ['usuario']

    def validate_imagen_para_binario(self, archivo):
        if not archivo:
            return archivo
        tipos_permitidos = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
        if archivo.content_type not in tipos_permitidos:
            raise ValidationError('Formato no permitido. Usa JPG, PNG, WebP o GIF.')
        if archivo.size > IMAGEN_MAX_BYTES:
            raise ValidationError('La imagen no puede superar 5 MB.')
        return archivo

    def create(self, validated_data):
        # Extraemos el archivo binario antes de crear el objeto
        archivo_binario = validated_data.pop('imagen_para_binario', None)
        imagen = Imagen.objects.create(**validated_data)
        if archivo_binario:
            # Leemos los bytes del archivo y los guardamos en el campo binario
            imagen.imagen_binaria = archivo_binario.read()
            imagen.save()
        return imagen

    def update(self, instance, validated_data):
        # Extraemos el archivo binario si se envio en la actualizacion
        archivo_binario = validated_data.pop('imagen_para_binario', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if archivo_binario:
            instance.imagen_binaria = archivo_binario.read()
        instance.save()
        return instance


# -----------------------------------------------------------
# Serializador de Audio
# -----------------------------------------------------------
class AudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audio
        fields = [
            'id',
            'archivo',
            'descripcion',
            'usuario',
        ]
        read_only_fields = ['usuario']

    def validate_archivo(self, archivo):
        if not archivo:
            return archivo
        tipos_permitidos = {'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'}
        if archivo.content_type not in tipos_permitidos:
            raise ValidationError('Formato no permitido. Usa MP3, WAV, OGG o M4A.')
        if archivo.size > AUDIO_MAX_BYTES:
            raise ValidationError('El audio no puede superar 10 MB.')
        return archivo