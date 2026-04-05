# Modelos de recursos multimedia: imagenes y audios
import base64
from django.db import models


# -----------------------------------------------------------
# Modelo de Imagen: almacena la imagen en el servidor (ImageField)
# y tambien en la base de datos como binario (BinaryField)
# -----------------------------------------------------------
class Imagen(models.Model):

    # Opciones de tipo de imagen
    TIPO_CHOICES = [
        ('escenario', 'Escenario'),
        ('personaje', 'Personaje'),
        ('portada', 'Portada'),
    ]

    # Ruta del archivo en el servidor (carpeta media/imagenes/)
    url = models.ImageField(upload_to='imagenes/', blank=True, null=True)

    # Copia binaria de la imagen guardada directamente en la base de datos
    imagen_binaria = models.BinaryField(blank=True, null=True)

    # Tipo de imagen segun su uso en la novela visual
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='escenario')

    # Descripcion opcional para identificar la imagen
    descripcion = models.CharField(max_length=255, blank=True)

    @property
    def imagen_base64(self):
        """Convierte la imagen binaria a base64 para mostrarla en el frontend"""
        if self.imagen_binaria:
            return base64.b64encode(self.imagen_binaria).decode('utf-8')
        return None

    class Meta:
        verbose_name = 'Imagen'
        verbose_name_plural = 'Imagenes'

    def __str__(self):
        return f'{self.tipo} - {self.descripcion or self.id}'


# -----------------------------------------------------------
# Modelo de Audio: almacena el archivo de sonido en el servidor
# -----------------------------------------------------------
class Audio(models.Model):

    # Archivo de audio guardado en media/audio/
    archivo = models.FileField(upload_to='audio/', blank=True, null=True)

    # Descripcion para identificar el audio
    descripcion = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Audio'
        verbose_name_plural = 'Audios'

    def __str__(self):
        return self.descripcion or f'Audio {self.id}'