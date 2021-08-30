from django.urls import path
from userform import views

app_name = 'userform'

urlpatterns = [
    path('', views.Userformview,name='add_user'),
    path('api/v1/usersubmit/', views.Usersubmit,name='user_submit'),
    path('userdetails/',views.UserListView.as_view(),name='user_list'),
    path('api/v1/userlist/', views.UserListAPIView.as_view(), name='user_list_api'),
    path('user/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    path('user/delete/', views.UserDeleteView, name='user_delete'),
]
