# Vistas de la app core
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import ContadorVisitas


def index(request):
    # Renderiza la pagina de inicio
    return render(request, 'index.html')


# -----------------------------------------------------------
# Vista del contador de visitas global
# GET  /api/visitas/ — devuelve el total actual
# POST /api/visitas/ — incrementa en 1 y devuelve el nuevo total
# -----------------------------------------------------------
class VisitasView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        contador, _ = ContadorVisitas.objects.get_or_create(id=1)
        return Response({'total': contador.total})

    def post(self, request):
        contador, _ = ContadorVisitas.objects.get_or_create(id=1)
        ContadorVisitas.objects.filter(id=1).update(total=contador.total + 1)
        return Response({'total': contador.total + 1})
