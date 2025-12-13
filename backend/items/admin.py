from django.contrib import admin
from .models import Item


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):

    list_display = ('name', 'group', 'created_at', 'id')

    list_filter = ('group',)

    search_fields = ('name', 'id')

    readonly_fields = ('id', 'created_at', 'updated_at')