# 檔案位址: src/api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import os
from dotenv import load_dotenv
import google.generativeai as genai
from rag_search import search, build_or_load_index

load_dotenv()

app = FastAPI()

# 解決跨域問題 (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 Gemini 與 RAG
API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)
model_gemini = genai.GenerativeModel("gemini-1.5-flash")

# 載入 RAG 索引
model_embedder, faiss_index, text_database = build_or_load_index(
    json_path="restaurant_data/restaurant_near_nuk.json",
    index_path="restaurant_data/restaurant.index",
    texts_path="restaurant_data/restaurant_texts.npy"
)

class ChatMessage(BaseModel):
    message: str
    history: List[Dict[str, str]] # 接收前端傳來的歷史紀錄

@app.post("/chat")
async def chat_endpoint(chat_data: ChatMessage):
    try:
        # 1. 執行 RAG 搜尋
        related_texts = search(chat_data.message, model_embedder, faiss_index, text_database, top_k=3)
        context = "\n".join([item["text"] for item in related_texts])

        # 2. 組合 Prompt (包含歷史紀錄)
        history_str = "\n".join([f"{h['role']}: {h['content']}" for h in chat_data.history])
        prompt = (
            f"你是一個友善的高大美食助手。以下是相關餐廳資訊：\n{context}\n\n"
            f"之前的對話：\n{history_str}\n\n"
            f"使用者最新問題：{chat_data.message}\n"
            "請根據資訊親切地回答。"
        )

        # 3. 生成回答
        response = model_gemini.generate_content(prompt)
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)