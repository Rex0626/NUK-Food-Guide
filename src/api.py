# 檔案位置: src/api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
import json
from dotenv import load_dotenv
from google import genai 
from src.rag_search import search, build_or_load_index 

load_dotenv()

app = FastAPI()

# 解決跨域問題 (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化新版 Gemini Client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# 載入 RAG 向量索引
model_embedder, faiss_index, text_database = build_or_load_index(
    json_path="restaurant_data/restaurant_near_nuk.json",
    index_path="restaurant_data/restaurant.index",
    texts_path="restaurant_data/restaurant_texts.npy"
)

# 讀取原始 JSON 資料庫
with open("restaurant_data/restaurant_near_nuk.json", "r", encoding="utf-8") as f:
    raw_restaurant_db = json.load(f)

@app.get("/")
def read_root():
    return {"status": "success", "message": "高大美食推薦系統後端正在穩健運行中 🍜"}

class ChatMessage(BaseModel):
    message: str
    history: List[Dict[str, str]]  # 前端傳過來的歷史紀錄陣列

@app.post("/chat")
async def chat_endpoint(chat_data: ChatMessage):
    try:
        # 1. 執行 RAG 搜尋（依據使用者最新問題檢索餐廳）
        related_texts = search(chat_data.message, model_embedder, faiss_index, text_database, top_k=3)
        context = "\n".join([item["text"] for item in related_texts])

        # 2. 從檢索結果中解析出店名，並撈取結構化資料
        matched_restaurants = []
        for item in related_texts:
            text_line = item["text"]
            if "店名：" in text_line:
                extracted_name = text_line.split("，")[0].replace("店名：", "").strip()
                for orig_repo in raw_restaurant_db:
                    if orig_repo.get("name") == extracted_name and orig_repo not in matched_restaurants:
                        matched_restaurants.append(orig_repo)

        # 3. 💡 新增：將前端傳來的對話歷史轉化為結構化文字
        history_text = ""
        for msg in chat_data.history:
            # 排除歡迎詞等預設非結構化訊息，避免干擾
            if "今天想在高雄大學附近找什麼好吃的呢" in msg["content"]:
                continue
            role_label = "使用者" if msg["role"] == "user" else "美食助手"
            history_text += f"{role_label}: {msg['content']}\n"

        # 4. 組合進階 Prompt，同時餵給 Gemini「RAG餐廳資訊」與「過往對話歷史」
        prompt = (
            f"你是一個友善的高大美食助手。\n"
            f"【最新檢索的餐廳資訊】\n{context}\n\n"
            f"【過往對話歷史紀錄（若為空則代表這是第一輪對話）】\n{history_text}\n"
            f"【使用者最新問題】\n{chat_data.message}\n\n"
            f"請結合歷史紀錄與最新餐廳資訊，給予使用者親切、連貫且有前後邏輯的回答。"
            f"如果使用者提及『剛才那家』或『上一家』，請對照歷史紀錄中的餐廳進行解答。"
        )

        # 5. 生成 AI 回覆
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return {
            "reply": response.text,
            "restaurants": matched_restaurants
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)