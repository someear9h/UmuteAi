from sqlalchemy import Column, String, Text, Integer
from db.database import Base

# to store user related data to ease the communication
class UserContext(Base):
    __tablename__= "user_contexts"

    id = Column(Integer, primary_key = True, index = True)
    key = Column(String, unique = True, index = True) # mother name, house address and all
    value = Column(Text) # answer of the key