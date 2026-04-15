from rest_framework import viewsets, filters
from rest_framework.permissions import IsAdminUser
from loguru import logger
from .models import BitacoraMovimiento
from .serializers import BitacoraMovimientoSerializer


# -----------------------------------------------------------
# ViewSet de BitacoraMovimiento: solo lectura, solo admin
# Soporta filtrado por: ?nombre_dato=Historia&tipo_movimiento=EDITAR
# -----------------------------------------------------------
class BitacoraViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class   = BitacoraMovimientoSerializer
    permission_classes = [IsAdminUser]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['nombre_dato', 'tipo_movimiento', 'host_origen', 'usuario__email']
    ordering_fields    = ['fecha_hora']
    ordering           = ['-fecha_hora']

    def get_queryset(self):
        qs = BitacoraMovimiento.objects.select_related('usuario').all()

        nombre_dato     = self.request.query_params.get('nombre_dato')
        tipo_movimiento = self.request.query_params.get('tipo_movimiento')
        fecha_desde     = self.request.query_params.get('fecha_desde')
        fecha_hasta     = self.request.query_params.get('fecha_hasta')

        if nombre_dato:
            qs = qs.filter(nombre_dato=nombre_dato)
        if tipo_movimiento:
            qs = qs.filter(tipo_movimiento=tipo_movimiento)
        if fecha_desde:
            qs = qs.filter(fecha_hora__date__gte=fecha_desde)
        if fecha_hasta:
            qs = qs.filter(fecha_hora__date__lte=fecha_hasta)

        return qs

    def list(self, request, *args, **kwargs):
        logger.info("Bitacora consultada | admin={}", request.user.email)
        return super().list(request, *args, **kwargs)
