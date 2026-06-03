# publisher.py
import json
from schemas_events import BaseEvent

# If you want to connect to a real Redis server later, you would uncomment this:
# import redis
# redis_client = redis.Redis(host="localhost", port=6379, db=0)

def publish_event(event: BaseEvent):
    """Publishes system events to a background processing queue."""
    # 1. Convert our Pydantic event object into a standard JSON string
    event_json = json.dumps(event.model_dump(), default=str)
    
    # 2. Production Line (Ready for Redis):
    # redis_client.rpush("school_events_queue", event_json)
    
    # 3. Development/MVP Visibility: Print the event vividly to the screen
    print("\n" + "="*50)
    print("📡 [EVENT PUBLISHED TO BACKGROUND QUEUE]")
    print(f"Type:    {event.event_type}")
    print(f"Payload: {event_json}")
    print("="*50 + "\n")