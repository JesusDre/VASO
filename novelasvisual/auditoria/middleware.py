import threading

# Almacenamiento local por hilo: cada request tiene sus propios datos
_thread_locals = threading.local()


def get_request_actual():
    """Devuelve el request del hilo actual, o None si no hay uno."""
    return getattr(_thread_locals, 'request', None)


def get_ip_actual():
    """Extrae la IP del request actual, considerando proxies."""
    request = get_request_actual()
    if not request:
        return ''
    # Si hay un proxy (ej. nginx), la IP real viene en HTTP_X_FORWARDED_FOR
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


def get_usuario_actual():
    """Devuelve el usuario autenticado del request actual, o None."""
    request = get_request_actual()
    if request and hasattr(request, 'user') and request.user.is_authenticated:
        return request.user
    return None


class AuditoriaMiddleware:
    """
    Middleware que guarda el request en el hilo actual para que
    las signals de auditoría puedan acceder a la IP y el usuario.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _thread_locals.request = request
        try:
            response = self.get_response(request)
        finally:
            # Limpiar para no filtrar datos entre requests
            _thread_locals.request = None
        return response
