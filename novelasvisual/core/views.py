# Vista de inicio del proyecto
from django.shortcuts import render

def index(request):
    # Renderiza la pagina de inicio
    return render(request, 'index.html')
