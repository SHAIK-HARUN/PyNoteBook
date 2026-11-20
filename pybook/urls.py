from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/run-code/', views.api_run_code, name='api_run_code'),
    path('api/algorithms/', views.api_algorithms, name='api_algorithms'),
    path('api/notebooks/', views.api_notebooks, name='api_notebooks'),
    path('api/notebooks/<int:notebook_id>/', views.api_notebook_detail, name='api_notebook_detail'),
    path('api/auth/login/', views.api_auth_login, name='api_auth_login'),
    path('api/auth/register/', views.api_auth_register, name='api_auth_register'),
    path('api/auth/logout/', views.api_auth_logout, name='api_auth_logout'),
    path('api/auth/me/', views.api_auth_me, name='api_auth_me'),
]
