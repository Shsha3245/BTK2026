from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    age: int = Field(..., ge=18, description="Kullanıcının yaşı")
    risk_tolerance: str = Field(..., description="Kullanıcının risk alma kapasitesi")
    investment_goal: str = Field(..., description="Yatırımın ana amacı") # <-- 't' harfini ekledik
    amount: float = Field(..., gt=0, description="Yatırım yapılacak TL miktarı")

    class Config:
        json_schema_extra = {
            "example": {
                "age": 25,
                "risk_tolerance": "yüksek",
                "investment_goal": "uzun vadeli büyüme", # <-- Burayı da düzelttik
                "amount": 50000.0
            }
        }

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str