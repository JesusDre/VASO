# Modelos de usuario personalizado y roles del sistema
import base64
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin


# -----------------------------------------------------------
# Manager personalizado: define como crear usuarios y superusuarios
# -----------------------------------------------------------
class MiUsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        # set_password encripta la contrasena automaticamente
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


# -----------------------------------------------------------
# Modelo de Rol: define los permisos de cada tipo de usuario
# -----------------------------------------------------------
class Rol(models.Model):
    # Nombre del rol (ej. administrador, lector, creador)
    nombre_rol = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'

    def __str__(self):
        return self.nombre_rol


# -----------------------------------------------------------
# Modelo de usuario personalizado: usa email en lugar de username
# -----------------------------------------------------------
class MiUsuario(AbstractUser, PermissionsMixin):
    # Eliminamos el campo username que trae Django por defecto
    username = None

    # Campos personales del usuario
    nombre = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    # Relacion con el rol del usuario
    id_rol = models.ForeignKey(
        Rol,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios'
    )

    # Campos requeridos por Django para el admin
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = MiUsuarioManager()

    # El email es el campo de autenticacion (reemplaza a username)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido_paterno']

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f'{self.nombre} {self.apellido_paterno} ({self.email})'