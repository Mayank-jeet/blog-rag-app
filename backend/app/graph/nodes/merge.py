import re
import base64

from app.graph.state import GraphState
from langchain_core.messages import AIMessage

IMAGE_MARKER_PATTERN = r"\[IMAGE: (.*?)\]"


def merge_node(state: GraphState) -> GraphState:
    blog = state["blog_with_image_markers"]
    images = state["generated_images"]

    def replace_marker(match):
        description = match.group(1)

        matching_image = next(
            (
                img
                for img in images
                if img["description"] == description
            ),
            None,
        )

        if matching_image:
            encoded = base64.b64encode(
                matching_image["image_data"]
            ).decode("utf-8")

            mime_type = matching_image["mime_type"]

            return (
                f"![{description}]"
                f"(data:{mime_type};base64,{encoded})"
            )

        return ""

    final_output = re.sub(
        IMAGE_MARKER_PATTERN,
        replace_marker,
        blog
    )

    state["final_output"] = final_output
    state["messages"] = [AIMessage(content=final_output)]

    return state