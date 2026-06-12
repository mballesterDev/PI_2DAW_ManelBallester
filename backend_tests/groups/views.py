from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Sum
from django.contrib.auth import get_user_model
from .models import Group
from .serializers import GroupSerializer
from results.models import TestResult

User = get_user_model()

# ✅ Importar la configuración completa de exámenes Cambridge
from results.views import CAMBRIDGE_EXAM_CONFIG


# ✅ Función auxiliar para obtener config de nivel
def get_level_config(level):
    return CAMBRIDGE_EXAM_CONFIG.get(level, {})


# ============================================
# GRUPOS - LISTAR Y CREAR (FUNCIONALIDAD ORIGINAL)
# ============================================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def groups_list_create(request):
    user = request.user

    if request.method == 'GET':
        groups = Group.objects.filter(owner=user)
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            group = serializer.save(owner=user)
            return Response(GroupSerializer(group).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# AÑADIR USUARIO AL GRUPO (FUNCIONALIDAD ORIGINAL)
# ============================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_user_to_group(request, group_id):
    username = request.data.get("username")
    if not username:
        return Response({"error": "Username is required"}, status=400)

    try:
        group = Group.objects.get(id=group_id, owner=request.user)
    except Group.DoesNotExist:
        return Response({"error": "Group not found or no permission"}, status=404)

    try:
        user_to_add = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if user_to_add in group.members.all():
        return Response({"error": "User already in group"}, status=400)

    group.members.add(user_to_add)
    return Response({"success": f"User {username} added to group"})


# ============================================
# PUNTUACIONES DEL GRUPO (MODIFICADO CON NIVELES)
# ============================================
@api_view(['GET'])
@permission_classes([AllowAny])
def group_scores(request, group_id):
    """
    Devuelve las puntuaciones de los miembros del grupo agrupadas por nivel y sección.
    Si no se especifica nivel, devuelve todos los niveles disponibles.
    """
    # Obtener nivel de los parámetros de la URL (opcional)
    requested_level = request.GET.get("level")
    
    try:
        group = Group.objects.get(id=group_id)
    except Group.DoesNotExist:
        return Response({"error": "Group not found"}, status=404)

    members = group.members.all()
    data = []

    for member in members:
        # Obtener todos los resultados del miembro
        results = TestResult.objects.filter(user=member)
        
        if requested_level:
            results = results.filter(level=requested_level)
        
        # Agrupar por nivel y sección
        scores_by_level = {}
        
        for result in results:
            level = result.level
            section = result.section
            part = result.part
            score = result.score
            
            # Obtener configuración del nivel
            level_config = get_level_config(level)
            if not level_config:
                continue
            
            # Inicializar estructura para este nivel si no existe
            if level not in scores_by_level:
                scores_by_level[level] = {}
            
            # Inicializar estructura para esta sección si no existe
            if section not in scores_by_level[level]:
                scores_by_level[level][section] = {
                    'score': 0,
                    'max_score': 0,
                    'parts': {}
                }
            
            # Obtener max_score de la parte desde la configuración
            parts_config = level_config.get('parts', {}).get(section, {})
            max_part_score = parts_config.get(str(part), 0)
            
            # Acumular puntuación de la sección
            scores_by_level[level][section]['score'] += score
            scores_by_level[level][section]['max_score'] += max_part_score
            
            # Guardar puntuación por parte
            if str(part) not in scores_by_level[level][section]['parts']:
                scores_by_level[level][section]['parts'][str(part)] = {
                    'score': 0,
                    'max': 0
                }
            
            scores_by_level[level][section]['parts'][str(part)]['score'] += score
            scores_by_level[level][section]['parts'][str(part)]['max'] = max_part_score
        
        # Redondear puntuaciones
        for level, level_data in scores_by_level.items():
            for section, section_data in level_data.items():
                section_data['score'] = round(section_data['score'], 2)
                for part, part_data in section_data['parts'].items():
                    part_data['score'] = round(part_data['score'], 2)
        
        data.append({
            "username": member.username,
            "scores_by_level": scores_by_level
        })
    
    return Response(data)