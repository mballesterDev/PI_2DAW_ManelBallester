from django.contrib import admin
from .models import Exercise
from django.utils.html import format_html

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('id', 'level', 'section', 'part', 'model_name', 'has_content', 'has_video', 'image1_tag', 'image2_tag', 'image3_tag')

    # ✅ FILTROS
    list_filter = (
        'level',
        'section',
        'part',
        'model_name',
    )

    # ✅ CAMPOS DE BÚSQUEDA
    search_fields = (
        'model_name',
        'level',
        'section',
        'part',
        'content__title',
        'enunciado',
        'video',
        'explanation',  # Añadido explanation
    )

    # ✅ CAMPOS DE SOLO LECTURA
    readonly_fields = ('id',)

    # ✅ ORDENACIÓN POR DEFECTO
    ordering = ('level', 'section', 'part', 'model_name')

    # ✅ PAGINACIÓN
    list_per_page = 50

    # ✅ MOSTRAR MÁS CAMPOS EN EL FORMULARIO DE EDICIÓN
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'level', 'section', 'part', 'model_name')
        }),
        ('Content & Media', {
            'fields': ('content', 'video', 'explanation', 'enunciado')  # ✅ Quité 'transcription', añadí 'explanation'
        }),
        ('Images', {
            'fields': ('image1', 'image2', 'image3'),
            'classes': ('collapse',)
        }),
    )

    # ✅ ACCIONES PERSONALIZADAS
    actions = ['duplicate_selected', 'mark_as_b1', 'mark_as_b2', 'mark_as_c1', 'mark_as_c2']

    def has_content(self, obj):
        """Indica si el ejercicio tiene contenido"""
        return bool(obj.content and obj.content != {})
    has_content.boolean = True
    has_content.short_description = 'Has Content'

    def has_video(self, obj):
        """Indica si tiene video"""
        return bool(obj.video)
    has_video.boolean = True
    has_video.short_description = 'Has Video'

    # Miniaturas de imágenes
    def image1_tag(self, obj):
        if obj.image1:
            return format_html('<img src="{}" style="max-height:50px; max-width:50px; border-radius:4px;"/>', obj.image1.url)
        return "-"
    image1_tag.short_description = 'Img 1'

    def image2_tag(self, obj):
        if obj.image2:
            return format_html('<img src="{}" style="max-height:50px; max-width:50px; border-radius:4px;"/>', obj.image2.url)
        return "-"
    image2_tag.short_description = 'Img 2'

    def image3_tag(self, obj):
        if obj.image3:
            return format_html('<img src="{}" style="max-height:50px; max-width:50px; border-radius:4px;"/>', obj.image3.url)
        return "-"
    image3_tag.short_description = 'Img 3'

    # ✅ ACCIONES PERSONALIZADAS
    def duplicate_selected(self, request, queryset):
        """Duplicar ejercicios seleccionados"""
        for exercise in queryset:
            exercise.pk = None
            exercise.model_name = f"{exercise.model_name} (copy)"
            exercise.save()
        self.message_user(request, f"{queryset.count()} exercises duplicated successfully.")
    duplicate_selected.short_description = "Duplicate selected exercises"

    def mark_as_b1(self, request, queryset):
        """Marcar como nivel B1"""
        updated = queryset.update(level='B1')
        self.message_user(request, f"{updated} exercises marked as B1.")
    mark_as_b1.short_description = "Mark selected as B1"

    def mark_as_b2(self, request, queryset):
        """Marcar como nivel B2"""
        updated = queryset.update(level='B2')
        self.message_user(request, f"{updated} exercises marked as B2.")
    mark_as_b2.short_description = "Mark selected as B2"

    def mark_as_c1(self, request, queryset):
        """Marcar como nivel C1"""
        updated = queryset.update(level='C1')
        self.message_user(request, f"{updated} exercises marked as C1.")
    mark_as_c1.short_description = "Mark selected as C1"

    def mark_as_c2(self, request, queryset):
        """Marcar como nivel C2"""
        updated = queryset.update(level='C2')
        self.message_user(request, f"{updated} exercises marked as C2.")
    mark_as_c2.short_description = "Mark selected as C2"

    # ✅ CONSOLA DE DEPURACIÓN
    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related()