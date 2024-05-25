from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

from django.core.asgi import get_asgi_application
from websocket_handler.routing import websocket_urlpatterns

import os


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'NexusC2.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})