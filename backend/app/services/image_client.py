import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_image(description: str):
    model = genai.GenerativeModel("gemini-3.1-flash-image")
    response = model.generate_content(description)

    for part in response.parts:
        if part.inline_data is not None and part.inline_data.data:
            return {
                "data": part.inline_data.data,
                "mime_type": part.inline_data.mime_type,
            }

    print("NO IMAGE DATA")
    print("Description:", description)
    print("Response:", response)
    raise RuntimeError("Gemini did not return an image")