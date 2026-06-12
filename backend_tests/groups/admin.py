from django.contrib import admin
from .models import Group

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner')  # Lo que se muestra en la lista
    search_fields = ('name', 'owner__username')  # Búsqueda por nombre de grupo y nombre de usuario del dueño
    filter_horizontal = ('members',)  # Para seleccionar miembros con un widget más cómodo
