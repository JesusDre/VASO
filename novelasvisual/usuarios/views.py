# Vistas de la app usuarios
from django.contrib.auth import get_user_model
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny
from .models import Rol
from .serializers import RegistroSerializer, RolSerializer, UsuarioSerializer

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
# -----------------------------------------------------------
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer