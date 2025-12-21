from sqlalchemy.orm import Session
from db.database import SessionLocal, engine, Base
from models.user_context import UserContext

# Create tables
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # Clear old data
    db.query(UserContext).delete()
    
    # Demo Data
    facts = [
        UserContext(key="spouse_name", value="Sarah"),
        UserContext(key="home_address", value="42 Wallaby Way, Sydney"),
        UserContext(key="dog_name", value="Buster"),
        UserContext(key="emergency_contact", value="Dr. Smith at 555-0199")
    ]
    
    db.add_all(facts)
    db.commit()
    print("Database seeded with User Context!")
    db.close()

if __name__ == "__main__":
    seed_data()