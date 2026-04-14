from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.apps import apps
from .middleware import get_ip_actual, get_usuario_actual

# Modelos que serán auditados: 'app_label.ModelName'
MODELOS_AUDITABLES = [
    'historias.Historia',
    'historias.Categoria',
    'usuarios.MiUsuario',
    'nodos.Nodo',
]


def instancia_a_dict(instance):
    """Convierte una instancia de modelo a un dict JSON-serializable."""
    data = {}
    for field in instance._meta.fields:
        value = getattr(instance, field.attname, None)
        if hasattr(value, 'isoformat'):
            data[field.name] = value.isoformat()
        elif hasattr(value, 'pk'):
            data[field.name] = value.pk
        else:
            try:
                # Verificar que el valor es serializable
                import json
                json.dumps(value)
                data[field.name] = value
            except (TypeError, ValueError):
                data[field.name] = str(value)
    return data


def registrar_movimiento(nombre_dato, tipo, valor_anterior, valor_nuevo):
    """Crea un registro en la bitácora."""
    # Importación local para evitar circular imports al iniciar Django
    BitacoraMovimiento = apps.get_model('auditoria', 'BitacoraMovimiento')
    try:
        BitacoraMovimiento.objects.create(
            nombre_dato     = nombre_dato,
            tipo_movimiento = tipo,
            valor_anterior  = valor_anterior,
            valor_nuevo     = valor_nuevo,
            host_origen     = get_ip_actual(),
            usuario         = get_usuario_actual(),
        )
    except Exception:
        # La bitácora nunca debe romper el flujo normal de la aplicación
        pass


# -----------------------------------------------------------
# pre_save: captura el estado anterior antes de guardar
# -----------------------------------------------------------
def _pre_save_handler(sender, instance, **kwargs):
    if instance.pk:
        try:
            anterior = sender.objects.get(pk=instance.pk)
            instance._auditoria_valor_anterior = instancia_a_dict(anterior)
        except sender.DoesNotExist:
            instance._auditoria_valor_anterior = None
    else:
        instance._auditoria_valor_anterior = None


# -----------------------------------------------------------
# post_save: registra CREAR o EDITAR
# -----------------------------------------------------------
def _post_save_handler(sender, instance, created, **kwargs):
    nombre = sender.__name__
    valor_anterior = getattr(instance, '_auditoria_valor_anterior', None)
    valor_nuevo = instancia_a_dict(instance)

    if created:
        registrar_movimiento(nombre, 'CREAR', None, valor_nuevo)
    else:
        registrar_movimiento(nombre, 'EDITAR', valor_anterior, valor_nuevo)


# -----------------------------------------------------------
# post_delete: registra ELIMINAR
# -----------------------------------------------------------
def _post_delete_handler(sender, instance, **kwargs):
    nombre = sender.__name__
    valor_anterior = instancia_a_dict(instance)
    registrar_movimiento(nombre, 'ELIMINAR', valor_anterior, None)


# -----------------------------------------------------------
# Conectar signals a los modelos auditables
# Se llama desde AuditoriaConfig.ready()
# -----------------------------------------------------------
def conectar_signals():
    for modelo_path in MODELOS_AUDITABLES:
        try:
            modelo = apps.get_model(modelo_path)
            pre_save.connect(_pre_save_handler,   sender=modelo, weak=False)
            post_save.connect(_post_save_handler,  sender=modelo, weak=False)
            post_delete.connect(_post_delete_handler, sender=modelo, weak=False)
        except LookupError:
            pass
