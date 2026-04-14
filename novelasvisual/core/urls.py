from django.urls import path
from .views import VisitasView

urlpatterns = [
    path('api/visitas/', VisitasView.as_view(), name='visitas'),
]
