import json
import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# ----------- 文字整理 ----------
def json_to_text(doc):
    name = doc.get("name", "未知店名")
    rating = doc.get("rating", "未知評分")
    review_count = len(doc.get("reviews", []))

    opening_hours_raw = doc.get("opening_hours") or []
    hours = "，".join([h.replace("星期", "周") for h in opening_hours_raw])

    price_level_map = {0: "免費", 1: "便宜", 2: "中等", 3: "昂貴", 4: "非常昂貴"}
    price = price_level_map.get(doc.get("price_level"), "無價格資訊")

    reviews_raw = doc.get("reviews", [])
    reviews = "\n".join([r.get("text", "") for r in reviews_raw if isinstance(r, dict)])

    return f"店名：{name}，評分：{rating}（{review_count} 則評論），營業時間：{hours}，價格：{price}\n評論：{reviews}"

# ----------- 建立或載入向量索引 ----------
def build_or_load_index(
    json_path="restaurant_data/restaurant_near_nuk.json",
    index_path="restaurant_data/restaurant.index",
    texts_path="restaurant_data/restaurant_texts.npy"
):
    model = SentenceTransformer("distiluse-base-multilingual-cased")

    if os.path.exists(index_path) and os.path.exists(texts_path):
        print("✅ 已載入現有的向量索引與文本資料")
        index = faiss.read_index(index_path)
        texts = np.load(texts_path, allow_pickle=True).tolist()
    else:
        print("⚠️ 未發現索引，正在重新建立...")
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        texts = [json_to_text(d) for d in data]
        embeddings = model.encode(texts, convert_to_numpy=True)

        index = faiss.IndexFlatL2(embeddings.shape[1])
        index.add(np.array(embeddings))
        faiss.write_index(index, index_path)
        np.save(texts_path, np.array(texts))
        print("✅ 已完成索引與文本儲存！")

    return model, index, texts

# ----------- 查詢函式 ----------
def search(query, model, index, texts, top_k=3):
    query_vec = model.encode([query], convert_to_numpy=True)
    D, I = index.search(np.array(query_vec), top_k)
    return [{"score": float(D[0][i]), "text": texts[idx]} for i, idx in enumerate(I[0])]
