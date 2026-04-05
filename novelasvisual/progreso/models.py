# Modelo de progreso del usuario en una historia
from django.db import models
from django.conf import settings


# -----------------------------------------------------------
# Modelo ProgresoUsuario: guarda en que nodo se quedo
# cada usuario dentro de cada historia
# -----------------------------------------------------------
class ProgresoUsuario(models.Model):

    # Usuario dueno del progreso
    id_usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='progresos'
    )

    # Historia en la que tiene progreso
    id_historia = models.ForeignKey(
        'historias.Historia',
        on_delete=models.CASCADE,
        related_name='progresos'
    )

    # Nodo en el que se encuentra actualmente el usuario
    id_nodo_actual = models.ForeignKey(
        'nodos.Nodo',
        on_delete=models.CASCADE,
        related_name='progresos'
    )

    # Fecha y hora de la ultima actualizacion del progreso
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Progreso de Usuario'
        verbose_name_plural = 'Progresos de Usuarios'
        # Un usuario solo puede tener un progreso activo por historia
        unique_together = ('id_usuario', 'id_historia')

    def __str__(self):
        return f'Usuario {self.id_usuario_id} | Historia {self.id_historia_id} | Nodo {self.id_nodo_actual_id}'