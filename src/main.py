from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import google.generativeai as ai
from rag_search import build_or_load_index,search

load_dotenv()

app = FastAPI()

# 允許 React (通常在 5173 埠) 進行跨網域請求 (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 RAG 索引
model_embedder, faiss_index, text_database = build_or_load_index()

# 初始化 Google Gemini API
ai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
gemini_model = ai.GenerativeModel(
    model_name="model/gemini-1.5-flash",
    system_instruction="你是一個專業的助理，幫助回答用戶的問題。根據用戶的問題，先從 RAG 索引中檢索相關文本，然後根據檢索到的文本生成回答。"
)

class QuestionRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(request: QuestionRequest):
    # 1. 從 RAG 索引中檢索相關文本
    related_results = search(request.message, model_embedder, faiss_index, text_database)
    context = "\n".join([item["text"] for item in related_results])

    # 2. 使用 Google Gemini API 生成回答
    prompt = f"相關餐廳資訊：\n{context}\n\n使用者問：{request.message}"
    response = gemini_model.generate_content(prompt)

    return {"reply": response.text}

if __name__ == "__main__":  
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port = 8000)