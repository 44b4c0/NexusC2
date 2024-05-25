from django.urls import path
from .consumers import WebSocketClient

websocket_urlpatterns = [
    path('ws/<str:is_user>/<str:key_room_id>/<str:session_id>', WebSocketClient.as_asgi()),
]