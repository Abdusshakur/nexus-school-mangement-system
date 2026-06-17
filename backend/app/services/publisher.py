import json

from backend.app.schemas_events import BaseEvent


def publish_event(event: BaseEvent):
    event_json = json.dumps(event.model_dump(), default=str)

    print("\n" + "=" * 50)
    print("EVENT PUBLISHED TO BACKGROUND QUEUE")
    print(f"Type:    {event.event_type}")
    print(f"Payload: {event_json}")
    print("=" * 50 + "\n")
