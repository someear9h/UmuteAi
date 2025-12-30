import base64
import json
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from google import genai
from google.genai import types
from core.config import settings
from models.user_context import UserContext
from db.database import get_db
from sqlalchemy.orm import Session
from elevenlabs.client import ElevenLabs


router = APIRouter(
    prefix="/speech",
    tags=["Speech Processing"]
)

elevenlabs = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)

# Initialize Gemini Client
client = genai.Client(api_key=settings.GEMINI_API_KEY)
MODEL_NAME = "gemini-2.5-flash-lite"

# --- Schemas ---
class TextRequest(BaseModel):
    text: str
    voice_id: str="21m00Tcm4TlvDq8ikWAM" # default voice

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
async def deduce_intent(request: TextRequest, db: Session = Depends(get_db)):
    
    # get all content from the database about the user context
    context_items = db.query(UserContext).all()

    # FORMAT THIS INTO A STRING FOR AI 
    user_context_str = ". ".join([f"{item.key} is {item.value}" for item in context_items])

    print(f"[2] Deducing intent for: {request.text}")
    try:
        system_instruction = f"""You are an interpreter for a person with Aphasia.
        
        IMPORTANT USER CONTEXT:
        {user_context_str}
        
        Use this context to fill in missing details (names, places) if relevant.
        Output exactly 3 likely complete sentences.
        Assume a polite, conversational tone suitable for adults.
        Format response as JSON: {{ "options": ["Sentence 1", "Sentence 2", "Sentence 3"] }}"""

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
    print(f"[3] Generating ElevenLabs Speech for: {request.text} (Voice: {request.voice_id})")
    
    try:
        # 3. Generate Audio Stream
        # We do NOT use play(). We just want the data.
        audio_generator = elevenlabs.text_to_speech.convert(
            text=request.text,
            voice_id=request.voice_id,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128"
        )

        # 4. Convert Generator to Bytes
        # ElevenLabs returns a generator, so we must join the chunks into one file
        audio_bytes = b"".join(audio_generator)

        # 5. Convert to Base64 for Frontend
        base64_audio = base64.b64encode(audio_bytes).decode("utf-8")
        
        return {"audio_base64": base64_audio}

    except Exception as e:
        print(f"❌ ElevenLabs Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))