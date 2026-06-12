from rest_framework import viewsets
from .models import Exercise
from .serializers import ExerciseSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        level = self.request.query_params.get('level')
        section = self.request.query_params.get('section')
        part = self.request.query_params.get('part')
        model_name = self.request.query_params.get('model_name')

        if level:
            queryset = queryset.filter(level=level)
        if section:
            queryset = queryset.filter(section=section)
        if part:
            queryset = queryset.filter(part=part)
        if model_name:
            queryset = queryset.filter(model_name=model_name)
        return queryset






    

# Rutas automáticas creadas por DefaultRouter para ExerciseViewSet:

# GET     /api/exercises/           -> Lista todos los ejercicios (con filtros opcionales: level, section, part, model_name)
# POST    /api/exercises/           -> Crea un nuevo ejercicio
# GET     /api/exercises/{id}/      -> Obtiene un ejercicio por su ID
# PUT     /api/exercises/{id}/      -> Actualiza un ejercicio por su ID (reemplazo completo)
# PATCH   /api/exercises/{id}/      -> Actualización parcial de un ejercicio
# DELETE  /api/exercises/{id}/      -> Elimina un ejercicio por su ID

# Parámetros de consulta (query params) para filtrar la lista en GET /api/exercises/:
# - level: 'B2' o 'C1' (ejemplo: ?level=C1)
# - section: 'reading', 'listening', 'writing', 'speaking' (ejemplo: ?section=reading)
# - part: número entero (ejemplo: ?part=2)
# - model_name: string con el nombre del modelo (ejemplo: ?model_name=model1)

# Ejemplo completo de petición filtrada:
# GET /api/exercises/?level=C1&section=reading&part=2&model_name=model1
