from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="Generated Deck")
    created_at = Column(DateTime, default=datetime.utcnow)

    cards = relationship("Card", back_populates="deck", cascade="all, delete")


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id"))
    question = Column(String)
    answer = Column(String)

    # Spaced repetition fields (used properly in a later step)
    ease_factor = Column(Integer, default=250)     # SM-2 default of 2.5, stored x100 to avoid floats
    interval_days = Column(Integer, default=0)
    next_review = Column(DateTime, default=datetime.utcnow)

    deck = relationship("Deck", back_populates="cards")