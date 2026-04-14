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
# Permiso a nivel de objeto: solo el creador de la historia puede modificarla
# Los admins (is_staff) también tienen acceso completo
# -----------------------------------------------------------
class EsPropietarioOAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.id_creador == request.user or request.user.is_staff


# -----------------------------------------------------------
# ViewSet de Historia: lectura publica, escritura requiere auth
# Soporta filtrado por categoria: GET /api/historias/?categoria=<id>
# -----------------------------------------------------------
class HistoriaViewSet(viewsets.ModelViewSet):
    serializer_class   = HistoriaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, EsPropietarioOAdmin]

    def get_queryset(self):
        # Excluir historias de usuarios deshabilitados (por is_active o activo)
        qs = Historia.objects.filter(id_creador__is_active=True, id_creador__activo=True)
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