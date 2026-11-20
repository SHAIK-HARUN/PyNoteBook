from django.contrib import admin
from .models import Notebook, Page, NotebookBlock, Algorithm


class NotebookBlockInline(admin.TabularInline):
    model = NotebookBlock
    extra = 1
    fields = ('order', 'block_type', 'content', 'output', 'is_selected')


class PageInline(admin.StackedInline):
    model = Page
    extra = 1
    fields = ('page_number', 'title', 'date_str')


@admin.register(Notebook)
class NotebookAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'cover_color', 'created_at', 'updated_at')
    search_fields = ('title', 'description')
    inlines = [PageInline]


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('title', 'notebook', 'page_number', 'date_str', 'created_at')
    list_filter = ('notebook',)
    inlines = [NotebookBlockInline]


@admin.register(NotebookBlock)
class NotebookBlockAdmin(admin.ModelAdmin):
    list_display = ('id', 'page', 'order', 'block_type', 'is_selected', 'created_at')
    list_filter = ('block_type', 'is_selected')
    search_fields = ('content', 'output')


@admin.register(Algorithm)
class AlgorithmAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'difficulty', 'time_complexity', 'space_complexity')
    list_filter = ('category', 'difficulty')
    search_fields = ('name', 'headline', 'theory', 'code')
