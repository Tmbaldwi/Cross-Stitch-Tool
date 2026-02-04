from fastapi import APIRouter

router = APIRouter()

@router.get("/hello")
def hello():
    return {"message": "Hello World!"}

@router.get("/greet/{name}")
def greet(name: str):
    return {"message": f"Hello, {name}!"}
