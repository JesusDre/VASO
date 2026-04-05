# Modelo de Historia: unidad principal de la novela visual
from django.db import models
from django.conf import settings


# -----------------------------------------------------------
# Modelo Historia
# Nota: id_nodo_inicio es null=True para resolver la referencia circular
# con el modelo Nodo (que aun no existe cuando se crea la historia)
# -----------------------------------------------------------
class Historia(models.Model):

    # Titulo visible de la historia
    titulo = models.CharField(max_length=200)

    # Descripcion o sinopsis de la historia
    descripcion = models.TextField(blank=True)

    # Fecha en que fue creada (se llena automaticamente)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    # Indica si la historia esta publicada o es borrador
    publicada = models.BooleanField(default=False)

    # Usuario que creo la historia (FK a MiUsuario)
    id_creador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='historias_creadas'
    )

    # Nodo de inicio de la historia (se asigna despues de crear los nodos)
    # null=True y blank=True para evitar referencia circular al crear la historia
    id_nodo_inicio = models.ForeignKey(
        'nodos.Nodo',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='historia_inicio'
    )

    # Imagen de portada de la historia (opcional)
    id_portada = models.ForeignKey(
        'recursos.Imagen',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='historias_portada'
    )

    class Meta:
        verbose_name = 'Historia'
        verbose_name_plural = 'Historias'

    def __str__(self):
        return self.titulo