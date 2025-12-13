from django.urls import path, include
from rest_framework.routers import DefaultRouter
from items.views import ItemViewSet

router = DefaultRouter()
# This registers the route 'items/'.
# Combined with the project url 'api/v1/', the full path becomes 'api/v1/items/'
router.register(r'items', ItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]