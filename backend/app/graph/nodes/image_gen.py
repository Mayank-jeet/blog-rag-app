import re

from app.graph.state import GraphState
from app.services.image_client import generate_image

IMAGE_MARKER_PATTERN = r"\[IMAGE: (.*?)\]"


def image_gen_node(state: GraphState) -> GraphState:

    blog = state["blog_with_image_markers"]
    
    descriptions = re.findall(
        IMAGE_MARKER_PATTERN,
        blog
    )

    generated_images = []

    for desc in descriptions:
        try:
            image = generate_image(desc)
            generated_images.append({
                "description": desc,
                "image_data": image["data"],
                "mime_type": image["mime_type"],
            })
        except RuntimeError as e:
            print(f"Skipping image for '{desc}': {e}")
            continue

    state["generated_images"] = generated_images

    return state