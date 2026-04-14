from django.db import models
from django.conf import settings


# -----------------------------------------------------------
# Bitácora de movimientos auditables
# Se escribe exclusivamente desde signals — nunca desde la API
# -----------------------------------------------------------
class BitacoraMovimiento(models.Model):

    TIPO_CHOICES = [
        ('CREAR',    'Crear'),
        ('EDITAR',   'Editar'),
        ('ELIMINAR', 'Eliminar'),
    ]

    # Nombre del modelo afectado (ej. "Historia", "MiUsuario")
    nombre_dato = models.CharField(max_length=100)

    # Tipo de operación realizada
    tipo_movimiento = models.CharField(max_length=10, choices=TIPO_CHOICES)

    # Estado del objeto antes del cambio (null en CREAR)
    valor_anterior = models.JSONField(null=True, blank=True)

    # Estado del objeto después del cambio (null en ELIMINAR)
    valor_nuevo = models.JSONField(null=True, blank=True)

    # Timestamp automático
    fecha_hora = models.DateTimeField(auto_now_add=True)

    # IP del cliente que originó la petición
    host_origen = models.CharField(max_length=100, blank=True)

    # Usuario autenticado (null si fue anónimo o acción interna)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='movimientos_bitacora'
    )

    class Meta:
        ordering             = ['-fecha_hora']
        verbose_name         = 'Movimiento en Bitácora'
        verbose_name_plural  = 'Bitácora de Movimientos'

    def __str__(self):
        usuario_str = str(self.usuario) if self.usuario else 'Anónimo'
        return f'[{self.tipo_movimiento}] {self.nombre_dato} — {usuario_str} — {self.fecha_hora}'
