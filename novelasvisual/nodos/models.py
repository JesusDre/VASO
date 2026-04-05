# Modelos de Nodo y Opcion para la estructura de la novela visual
from django.db import models


# -----------------------------------------------------------
# Modelo Nodo: representa una escena o pantalla de la novela visual
# -----------------------------------------------------------
class Nodo(models.Model):

    # Titulo interno para identificar el nodo en el editor
    titulo_nodo = models.CharField(max_length=200)

    # Texto narrativo que se muestra al jugador en esta escena
    texto = models.TextField()

    # Indica si este nodo es un final de la historia
    es_final = models.BooleanField(default=False)

    # Historia a la que pertenece este nodo
    id_historia = models.ForeignKey(
        'historias.Historia',
        on_delete=models.CASCADE,
        related_name='nodos'
    )

    # Imagen de escenario de fondo para esta escena (opcional)
    id_imagen_escenario = models.ForeignKey(
        'recursos.Imagen',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nodos_como_escenario'
    )

    # Audio de fondo para esta escena (opcional)
    id_audio_fondo = models.ForeignKey(
        'recursos.Audio',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nodos_con_audio'
    )

    class Meta:
        verbose_name = 'Nodo'
        verbose_name_plural = 'Nodos'

    def __str__(self):
        return f'{self.titulo_nodo} (Historia: {self.id_historia_id})'


# -----------------------------------------------------------
# Modelo Opcion: representa una eleccion que el jugador puede tomar
# desde un nodo, llevandolo a otro nodo
# -----------------------------------------------------------
class Opcion(models.Model):

    # Texto de la opcion que ve el jugador
    texto_opcion = models.CharField(max_length=300)

    # Nodo desde el cual se muestra esta opcion
    id_nodo_origen = models.ForeignKey(
        Nodo,
        on_delete=models.CASCADE,
        related_name='opciones_origen'
    )

    # Nodo al que lleva esta opcion cuando el jugador la elige
    id_nodo_destino = models.ForeignKey(
        Nodo,
        on_delete=models.CASCADE,
        related_name='opciones_destino'
    )

    class Meta:
        verbose_name = 'Opcion'
        verbose_name_plural = 'Opciones'

    def __str__(self):
        return f'{self.texto_opcion} (Nodo {self.id_nodo_origen_id} -> {self.id_nodo_destino_id})'