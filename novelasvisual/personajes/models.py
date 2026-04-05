# Modelos de Personaje y NodoPersonaje (tabla pivote)
from django.db import models


# -----------------------------------------------------------
# Modelo Personaje: un personaje que aparece en una historia
# -----------------------------------------------------------
class Personaje(models.Model):

    # Nombre del personaje
    nombre = models.CharField(max_length=150)

    # Historia a la que pertenece el personaje
    id_historia = models.ForeignKey(
        'historias.Historia',
        on_delete=models.CASCADE,
        related_name='personajes'
    )

    # Imagen del personaje (sprite o ilustracion), opcional
    id_imagen = models.ForeignKey(
        'recursos.Imagen',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='personajes'
    )

    # Relacion ManyToMany con Nodo usando la tabla through NodoPersonaje
    nodos = models.ManyToManyField(
        'nodos.Nodo',
        through='NodoPersonaje',
        related_name='personajes'
    )

    class Meta:
        verbose_name = 'Personaje'
        verbose_name_plural = 'Personajes'

    def __str__(self):
        return f'{self.nombre} (Historia: {self.id_historia_id})'


# -----------------------------------------------------------
# Modelo NodoPersonaje: tabla pivote que registra en que posicion
# aparece cada personaje dentro de un nodo especifico
# -----------------------------------------------------------
class NodoPersonaje(models.Model):

    # Opciones de posicion en pantalla
    POSICION_CHOICES = [
        ('izquierda', 'Izquierda'),
        ('centro', 'Centro'),
        ('derecha', 'Derecha'),
    ]

    # Nodo en el que aparece el personaje
    id_nodo = models.ForeignKey(
        'nodos.Nodo',
        on_delete=models.CASCADE,
        related_name='nodo_personajes'
    )

    # Personaje que aparece en el nodo
    id_personaje = models.ForeignKey(
        Personaje,
        on_delete=models.CASCADE,
        related_name='nodo_personajes'
    )

    # Posicion del personaje en la pantalla
    posicion = models.CharField(
        max_length=10,
        choices=POSICION_CHOICES,
        default='centro'
    )

    class Meta:
        verbose_name = 'Nodo Personaje'
        verbose_name_plural = 'Nodo Personajes'
        # Un personaje solo puede aparecer una vez por nodo
        unique_together = ('id_nodo', 'id_personaje')

    def __str__(self):
        return f'Nodo {self.id_nodo_id} | {self.id_personaje} | {self.posicion}'