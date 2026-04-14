# Vistas de la app historias
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, BasePermission, SAFE_METHODS
from .models import Historia, Categoria
from .serializers import HistoriaSerializer, CategoriaSerializer


# -----------------------------------------------------------
# Permiso: lectura pública, escritura solo para administradores (is_staff)
# -----------------------------------------------------------
class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_staff


# -----------------------------------------------------------
# ViewSet de Historia: lectura publica, escritura requiere auth
# Soporta filtrado por categoria: GET /api/historias/?categoria=<id>
# -----------------------------------------------------------
class HistoriaViewSet(viewsets.ModelViewSet):
    serializer_class   = HistoriaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Historia.objects.all()
        categoria_id = self.request.query_params.get('categoria')
        if categoria_id:
            qs = qs.filter(categoria_id=categoria_id)
        return qs


# -----------------------------------------------------------
# ViewSet de Categoria: lectura publica, escritura solo admin
# Solo devuelve categorías activas en el listado
# -----------------------------------------------------------
class CategoriaViewSet(viewsets.ModelViewSet):
    serializer_class   = CategoriaSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return Categoria.objects.filter(activa=True)