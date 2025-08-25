import os
from dotenv import load_dotenv
import google.generativeai as ai
from rag_search import build_or_load_index, search

def run_chat_bot(top_k=5, log_dir="logs"):
    """
    啟動 RAG + Gemini 聊天機器人
    top_k: 向量檢索返回的文本數量
    log_dir: 儲存聊天紀錄的資料夾
    """
    # ================== 加載 .env ==================
    load_dotenv()
    API_KEY = os.getenv("GOOGLE_API_KEY")
    if not API_KEY:
        raise ValueError("請先在 .env 設定 GOOGLE_API_KEY")

    # ================== 初始化 Gemini ==================
    ai.configure(api_key=API_KEY)
    model = ai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction="你是一个友善的美食推荐助手，专门根据使用者的问题，结合附近的店家资讯，推荐最合适的选择。"
    )
    chat = model.start_chat()

    # ================== RAG 索引 ==================
    model_embedder, faiss_index, text_database = build_or_load_index()

    # ================== 聊天歷史 ==================
    chat_history = []

    # ================== 日志文件夹 ==================
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "chat_history.txt")

    print("系統已準備就緒。輸入 Exit 離開。")

    while True:
        message = input("你: ")
        if message.lower() == "exit":
            print("結束聊天，掰掰！")
            break

        # -------- 向量檢索 --------
        try:
            related_texts = search(message, model_embedder, faiss_index, text_database, top_k=top_k)
        except Exception as e:
            print("⚠️ 向量檢索出錯：", e)
            continue

        # -------- 修正 related_texts 為純文字列表 --------
        related_texts_str = [item["text"] for item in related_texts]

        # -------- 整合 Prompt（加入歷史對話） --------
        history_text = "\n".join([f"{h['role']}: {h['content']}" for h in chat_history])
        context = "\n".join(related_texts_str)
        prompt = (
            f"{history_text}\n以下是與使用者問題相關的餐廳資訊：\n{context}\n\n"
            f"使用者問：「{message}」\n"
            "請根據以上資訊，用自然、口語的語氣回答他～"
        )

        # -------- Gemini 回答 --------
        try:
            response = chat.send_message(prompt)
            chat_history.append({"role": "user", "content": message})
            chat_history.append({"role": "assistant", "content": response.text})
        except Exception as e:
            print("⚠️ Gemini 回答失敗：", e)
            continue

        # -------- 輸出聊天 --------
        print("──────────────────────────────")
        print("ChatBot: ", response.text)
        print("──────────────────────────────")

    # ================== 儲存聊天紀錄 ==================
    with open(log_file, "w", encoding="utf-8") as f:
        for entry in chat_history:
            f.write(f"{entry['role']}: {entry['content']}\n")

    print(f"聊天紀錄已儲存至 {log_file}")

# ================== 如果直接執行，啟動聊天 ==================
if __name__ == "__main__":
    run_chat_bot()
