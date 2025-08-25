import gradio as gr
import os
from dotenv import load_dotenv
from rag_search import search, build_or_load_index
import google.generativeai as ai

def launch_food_chatbot(
    json_path="restaurant_data/restaurants_near_nuk_fullscan.json",
    index_path="restaurant_data/restaurant.index",
    texts_path="restaurant_data/restaurant_texts.npy",
    top_k=5,
    title="高大美食 AI 助手"
):
    """
    啟動 Gradio Web 版高大美食 AI 助手
    top_k: RAG 向量檢索返回的文本數量
    """

    # ----------------- 加载 .env -----------------
    load_dotenv()
    API_KEY = os.getenv("GOOGLE_API_KEY")
    if not API_KEY:
        raise ValueError("請先在 .env 設定 GOOGLE_API_KEY")

    # ----------------- 初始化 Gemini -----------------
    ai.configure(api_key=API_KEY)
    model = ai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction="你是一个友善的美食推荐助手，专门根据使用者的问题，结合附近的店家资讯，推荐最合适的选择。"
    )

    # ----------------- 加载 RAG 索引 -----------------
    model_embedder, faiss_index, text_database = build_or_load_index(
        json_path=json_path,
        index_path=index_path,
        texts_path=texts_path
    )

    # ----------------- Gradio 聊天函数 -----------------
    def chatbot_function(message, history):
        try:
            # 整合历史对话
            history_text = "\n".join([f"{h[0]}: {h[1]}" for h in history])

            # RAG 搜索
            related_texts = search(message, model_embedder, faiss_index, text_database, top_k=top_k)
            related_texts_str = [item["text"] for item in related_texts]
            context = "\n".join(related_texts_str)

            # prompt = 历史 + RAG context + 当前问题
            prompt = (
                f"以下是之前的對話：\n{history_text}\n\n"
                f"以下是與使用者問題相關的餐廳資訊：\n{context}\n\n"
                f"使用者最新的問題是：「{message}」\n"
                "請根據以上內容，自然、口語化地回答～"
            )

            # ----------------- Gemini 回答（單次生成） -----------------
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"❌ 出現錯誤：{e}"

    # ----------------- 啟動 Gradio -----------------
    gr.ChatInterface(
        fn=chatbot_function,
        title=title,
        type="messages"  # ✅ 保留历史对话
    ).launch()

# ----------------- 如果直接執行，就啟動 Web 聊天 -----------------
if __name__ == "__main__":
    launch_food_chatbot()
