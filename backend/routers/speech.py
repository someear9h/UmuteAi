import base64
import json
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from core.config import settings

router = APIRouter(
    prefix="/speech",
    tags=["Speech Processing"]
)

# Initialize Gemini Client
client = genai.Client(api_key=settings.GEMINI_API_KEY)
MODEL_NAME = "gemini-2.5-flash-lite"

# --- Schemas ---
class TextRequest(BaseModel):
    text: str

class IntentResponse(BaseModel):
    options: list[str]

class AudioResponse(BaseModel):
    audio_base64: str

# --- Endpoints ---

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    print(f"[1] Transcribing file: {file.filename}")
    try:
        audio_bytes = await file.read()
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[
                types.Part.from_bytes(data=audio_bytes, mime_type="audio/webm;codecs=opus"),
                "Transcribe this audio. Include stutters exactly as spoken. Return ONLY the text."
            ]
        )
        text = response.text.strip() if response.text else ""
        return {"text": text}
    except Exception as e:
        print(f"❌ Transcription Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deduce-intent", response_model=IntentResponse)
async def deduce_intent(request: TextRequest):
    print(f"[2] Deducing intent for: {request.text}")
    try:
        system_instruction = """You are an interpreter for a person with Aphasia. 
        You will receive fragmented text. Output exactly 3 likely complete sentences.
        Assume a polite, conversational tone suitable for adults.
        Format your response as a JSON object with a key 'options' containing a list of strings."""

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=f'Translate this fragment: "{request.text}"',
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "options": {
                            "type": "ARRAY",
                            "items": {"type": "STRING"}
                        }
                    },
                    "required": ["options"]
                }
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"❌ Intent Error: {e}")
        return {"options": ["Error processing intent.", "Please try again.", "Could not understand."]}

@router.post("/speak", response_model=AudioResponse)
async def generate_speech(request: TextRequest):
    print(f"[3] Generating speech for: {request.text}")
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=request.text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name="Kore"
                        )
                    )
                )
            )
        )
        audio_part = response.candidates[0].content.parts[0]
        base64_audio = base64.b64encode(audio_part.inline_data.data).decode("utf-8")
        return {"audio_base64": base64_audio}
    except Exception as e:
        print(f"❌ Speech Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))