from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg
from django.contrib.auth import get_user_model
from .models import Group
from .serializers import GroupSerializer
from results.models import TestResult

User = get_user_model()

# ✅ Máximos oficiales por nivel B2/C1
MAX_SCORES_BY_PART = {
    "reading": {1: 8, 2: 8, 3: 8, 5: 12, 6: 8, 7: 6},
    "listening": {1: 6, 2: 8, 3: 6, 4: 10},
    "writing": {},
    "speaking": {},
}

@api_view(['GET'])
@permission_classes([AllowAny])
def group_scores(request, group_id):
    level = request.GET.get("level")

    try:
        group = Group.objects.get(id=group_id)
    except Group.DoesNotExist:
        return Response({"error": "Group not found"}, status=404)

    members = group.members.all()
    data = []

    for member in members:
        filter_args = {"user": member}
        if level:
            filter_args["level"] = level

        section_averages = (
            TestResult.objects
            .filter(**filter_args)
            .values('section')
            .annotate(average_score=Avg('score'))
        )

        sections = {}
        for sec_avg in section_averages:
            section_name = sec_avg['section']
            avg_score = sec_avg['average_score'] or 0

            part_averages = (
                TestResult.objects
                .filter(**filter_args, section=section_name)
                .values('part')
                .annotate(average_score=Avg('score'))
            )

            parts = {}
            for part_avg in part_averages:
                part = int(part_avg['part'])
                part_score = part_avg['average_score'] or 0
                max_part_score = MAX_SCORES_BY_PART.get(section_name, {}).get(part, 0)
                parts[str(part)] = {
                    "score": round(part_score, 2),
                    "max": max_part_score
                }

            max_section_score = sum(p["max"] for p in parts.values())
            sections[section_name] = {
                "score": round(avg_score, 2),
                "max_score": max_section_score,
                "parts": parts
            }

        data.append({
            "username": member.username,
            "sections": sections
        })

    return Response(data)


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
