from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Max, Avg, Sum  # ← AÑADIDO Sum
from .models import TestResult
from .serializers import TestResultSerializer, BestScoreSerializer

# ============================================
# CONFIGURACIÓN COMPLETA DE EXÁMENES CAMBRIDGE
# ============================================
CAMBRIDGE_EXAM_CONFIG = {
    "B1": {
        "sections": {
            "reading": 32,
            "writing": 40,
            "listening": 25,
            "speaking": 30
        },
        "parts": {
            "reading": {"1": 5, "2": 5, "3": 5, "4": 5, "5": 6, "6": 6},
            "writing": {"1": 20, "2": 20},
            "listening": {"1": 7, "2": 6, "3": 6, "4": 6},
            "speaking": {}
        },
        "global": {
            "skills_count": 4,
            "certificate_range": {"min": 120, "max": 170},
            "grades": {
                "A": {"min": 160, "max": 170, "cefr": "B2", "text": "Pass with Distinction"},
                "B": {"min": 153, "max": 159, "cefr": "B1", "text": "Pass with Merit"},
                "C": {"min": 140, "max": 152, "cefr": "B1", "text": "Pass"}
            }
        }
    },
    "B2": {
        "sections": {
            "reading": 42,
            "use_of_english": 28,
            "writing": 40,
            "listening": 30,
            "speaking": 60
        },
        "parts": {
            "reading": {"1": 8, "5": 12, "6": 12, "7": 10},
            "use_of_english": {"2": 8, "3": 8, "4": 12},
            "writing": {"1": 20, "2": 20},
            "listening": {"1": 8, "2": 10, "3": 5, "4": 7},
            "speaking": {}
        },
        "global": {
            "skills_count": 5,
            "certificate_range": {"min": 140, "max": 190},
            "grades": {
                "A": {"min": 180, "max": 190, "cefr": "C1", "text": "Grade A"},
                "B": {"min": 173, "max": 179, "cefr": "B2", "text": "Grade B"},
                "C": {"min": 160, "max": 172, "cefr": "B2", "text": "Grade C"}
            }
        }
    },
    "C1": {
        "sections": {
            "reading": 50,
            "use_of_english": 28,
            "writing": 40,
            "listening": 30,
            "speaking": 75
        },
        "parts": {
            "reading": {"1": 8, "5": 12, "6": 8, "7": 12, "8": 10},
            "use_of_english": {"2": 8, "3": 8, "4": 12},
            "writing": {"1": 20, "2": 20},
            "listening": {"1": 6, "2": 8, "3": 6, "4": 10},
            "speaking": {}
        },
        "global": {
            "skills_count": 5,
            "certificate_range": {"min": 160, "max": 210},
            "grades": {
                "A": {"min": 200, "max": 210, "cefr": "C2", "text": "Grade A"},
                "B": {"min": 193, "max": 199, "cefr": "C1", "text": "Grade B"},
                "C": {"min": 180, "max": 192, "cefr": "C1", "text": "Grade C"}
            }
        }
    },
    "C2": {
        "sections": {
            "reading": 44,
            "use_of_english": 28,
            "writing": 40,
            "listening": 30,
            "speaking": 75
        },
        "parts": {
            "reading": {"1": 8, "5": 12, "6": 14, "7": 10},
            "use_of_english": {"2": 8, "3": 8, "4": 12},
            "writing": {"1": 20, "2": 20},
            "listening": {"1": 6, "2": 9, "3": 5, "4": 10},
            "speaking": {}
        },
        "global": {
            "skills_count": 5,
            "certificate_range": {"min": 180, "max": 230},
            "grades": {
                "A": {"min": 220, "max": 230, "cefr": "C2", "text": "Grade A"},
                "B": {"min": 213, "max": 219, "cefr": "C2", "text": "Grade B"},
                "C": {"min": 200, "max": 212, "cefr": "C2", "text": "Grade C"}
            }
        }
    }
}


# ============================================
# ENDPOINTS
# ============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def exam_config(request):
    """Devuelve la configuración completa de todos los niveles"""
    return Response(CAMBRIDGE_EXAM_CONFIG, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_test_result(request):
    data = request.data
    user = request.user

    obj, created = TestResult.objects.update_or_create(
        user=user,
        level=data.get("level"),
        section=data.get("section"),
        part=data.get("part"),
        model_name=data.get("model_name"),
        defaults={"score": data.get("score")}
    )
    return Response({"message": "Resultado guardado correctamente"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def best_results(request):
    level = request.GET.get("level")
    section = request.GET.get("section")
    part = request.GET.get("part")
    model_name = request.GET.get("model_name")

    queryset = TestResult.objects.filter(
        user=request.user,
        level=level, 
        section=section, 
        part=part
    )

    if model_name:
        queryset = queryset.filter(model_name=model_name)

    results = queryset.values('model_name').annotate(best_score=Max('score'))

    # Añadir máximo oficial por parte desde la configuración
    for r in results:
        part_int = int(part)
        config = CAMBRIDGE_EXAM_CONFIG.get(level, {})
        max_score = config.get('parts', {}).get(section, {}).get(str(part_int), 0)
        r['max_score'] = max_score

    serializer = BestScoreSerializer(results, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def best_result_by_model(request):
    level = request.GET.get("level")
    section = request.GET.get("section")
    part = request.GET.get("part")
    model_name = request.GET.get("model_name")

    if not all([level, section, part, model_name]):
        return Response(
            {"error": "Faltan parámetros: level, section, part y model_name son obligatorios"},
            status=status.HTTP_400_BAD_REQUEST
        )

    best_score = (
        TestResult.objects
        .filter(user=request.user, level=level, section=section, part=part, model_name=model_name)
        .aggregate(best_score=Max("score"))
    )

    # Obtener máximo desde configuración
    config = CAMBRIDGE_EXAM_CONFIG.get(level, {})
    max_score = config.get('parts', {}).get(section, {}).get(str(int(part)), 0)

    return Response({
        "model_name": model_name,
        "best_score": best_score["best_score"] or 0,
        "max_score": max_score
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def session_status(request):
    return Response({"is_authenticated": request.user.is_authenticated}, status=status.HTTP_200_OK)


@api_view(['GET'])
def average_score_by_part(request):
    level = request.GET.get("level")
    section = request.GET.get("section")

    if not level or not section:
        return Response({"error": "level y section son requeridos"}, status=400)

    # Obtener configuración del nivel
    config = CAMBRIDGE_EXAM_CONFIG.get(level)
    if not config:
        return Response({"error": f"Nivel {level} no soportado"}, status=400)

    # Obtener promedios de la BD
    averages = (
        TestResult.objects
        .filter(user=request.user, level=level, section=section)
        .values('part')
        .annotate(average_score=Avg('score'))
        .order_by('part')
    )

    # Convertir a diccionario
    avg_dict = {str(a['part']): a['average_score'] for a in averages}

    # Construir respuesta usando la configuración
    result = []
    parts_config = config.get('parts', {}).get(section, {})
    
    for part_num, max_score in parts_config.items():
        result.append({
            "part": int(part_num),
            "average_score": avg_dict.get(str(part_num), 0.0),
            "max_score": max_score,
        })

    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET'])
def average_score_by_section(request):
    level = request.GET.get("level")

    if not level:
        return Response({"error": "level es requerido"}, status=400)

    # Obtener configuración del nivel
    config = CAMBRIDGE_EXAM_CONFIG.get(level)
    if not config:
        return Response({"error": f"Nivel {level} no soportado"}, status=400)

    result = []
    
    for section, max_score in config['sections'].items():
        # SUMA de todas las puntuaciones del usuario para esta sección
        total_score = TestResult.objects.filter(
            user=request.user, 
            level=level, 
            section=section
        ).aggregate(total=Sum('score'))['total'] or 0.0
        
        result.append({
            "section": section,
            "average_score": total_score,  # ← Ahora es la SUMA, no el promedio
            "max_score": max_score,
        })

    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def global_score(request):
    """Calcula la nota global y la calificación A/B/C según el nivel"""
    level = request.GET.get("level")

    if not level:
        return Response({"error": "level es requerido"}, status=400)

    config = CAMBRIDGE_EXAM_CONFIG.get(level)
    if not config:
        return Response({"error": f"Nivel {level} no soportado"}, status=400)

    sections_config = config['sections']
    grades_config = config['global']['grades']
    certificate_range = config['global']['certificate_range']

    # Obtener puntuaciones reales del usuario (SUMA por sección)
    section_scores = {}
    for section in sections_config.keys():
        total = TestResult.objects.filter(
            user=request.user, 
            level=level, 
            section=section
        ).aggregate(total=Sum('score'))['total'] or 0.0
        section_scores[section] = total

    # Calcular porcentaje por sección
    percentages = []
    section_percentages = {}
    for section, max_val in sections_config.items():
        if max_val > 0:
            pct = (section_scores.get(section, 0.0) / max_val) * 100
            percentages.append(pct)
            section_percentages[section] = round(pct, 2)

    if not percentages:
        return Response({"error": "No hay datos para calcular nota global"}, status=400)

    # Promedio simple de todas las secciones
    global_percentage = sum(percentages) / len(percentages)

    # Convertir porcentaje a Cambridge Scale (simplificado)
    scale_min = certificate_range['min']
    scale_max = certificate_range['max']
    cambridge_scale = scale_min + (global_percentage / 100) * (scale_max - scale_min)

    # Determinar calificación
    grade = "Fail"
    grade_info = None
    for grade_key, grade_data in grades_config.items():
        if cambridge_scale >= grade_data['min'] and cambridge_scale <= grade_data['max']:
            grade = grade_key
            grade_info = grade_data
            break

    return Response({
        "level": level,
        "scores": section_scores,
        "max_scores": sections_config,
        "percentages_by_section": section_percentages,
        "global_percentage": round(global_percentage, 2),
        "cambridge_scale": round(cambridge_scale, 2),
        "grade": grade,
        "grade_info": grade_info,
    }, status=status.HTTP_200_OK)