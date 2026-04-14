# Vistas de la app usuarios
from django.contrib.auth import get_user_model
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny
from loguru import logger
from .models import Rol
from .serializers import RegistroSerializer, RolSerializer, UsuarioSerializer
from historias.models import Historia

# Obtenemos el modelo personalizado
User = get_user_model()


# -----------------------------------------------------------
# Vista de registro: publica, no requiere autenticacion
# -----------------------------------------------------------
class RegistroView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegistroSerializer


# -----------------------------------------------------------
# ViewSet de Roles: CRUD completo con autenticacion
# -----------------------------------------------------------
class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer


# -----------------------------------------------------------
# ViewSet de Usuarios: CRUD completo con autenticacion
# Al deshabilitar un usuario sus historias pasan a borrador automaticamente
# -----------------------------------------------------------
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer

    def perform_update(self, serializer):
        usuario_antes = self.get_object()
        estaba_activo = usuario_antes.is_active and usuario_antes.activo
        usuario = serializer.save()
        ahora_activo = usuario.is_active and usuario.activo
        if estaba_activo and not ahora_activo:
            count = Historia.objects.filter(id_creador=usuario).update(publicada=False)
            logger.warning("Usuario deshabilitado | id={} email='{}' — {} historia(s) pasaron a borrador", usuario.id, usuario.email, count)
        else:
            logger.info("Usuario actualizado | id={} email='{}'", usuario.id, usuario.email)