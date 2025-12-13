from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Item
from .pagination import CustomCursorPagination
from .serializers import ItemListSerializer, ItemDetailSerializer


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()

    pagination_class = CustomCursorPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['group']
    search_fields = ['name']
    ordering_fields = ['created_at', 'name']

    def get_serializer_class(self):
        if self.action == 'list':
            return ItemListSerializer
        return ItemDetailSerializer