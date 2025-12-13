from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from items.views import ItemViewSet
from django.views.generic import RedirectView

router = DefaultRouter()
router.register(r'items', ItemViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('items.urls')),
    path('', RedirectView.as_view(url='/admin/', permanent=False)),

]