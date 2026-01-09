from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.user_context import UserContext
from core.config import settings
from db.database import SessionLocal, create_tables

# Import our new speech router
from routers import speech 

# Create DB tables (placeholder for now)
create_tables()

app = FastAPI(
    title="Unmute AI API",
    description="Neuro-Symbolic Aphasia Translation Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Handle CORS using the settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()

    db.query(UserContext).delete()

    db.add_all([
        UserContext(key="coffee_preference", value="medium black coffee with no sugar"),
        UserContext(key="spouse_name", value="Sarah"),
        UserContext(key="dog_name", value="Buster"),
    ])

    db.commit()
    db.close()

    print("✅ User context seeded on startup")

# Include the router
app.include_router(speech.router, prefix=settings.API_PREFIX)

if __name__=="__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)