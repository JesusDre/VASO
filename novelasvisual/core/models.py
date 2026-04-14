from django.db import models


# -----------------------------------------------------------
# Contador de visitas global del sitio
# Siempre tiene un solo registro (singleton, id=1)
# -----------------------------------------------------------
class ContadorVisitas(models.Model):
    total = models.PositiveBigIntegerField(default=0)

    class Meta:
        verbose_name        = 'Contador de Visitas'
        verbose_name_plural = 'Contador de Visitas'

    def __str__(self):
        return f'Visitas totales: {self.total}'
