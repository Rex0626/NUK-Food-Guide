# 高大 RAG 美食推薦系統
- 高大美食推薦系統旨在為國立高雄大學師生提供週邊餐飲推薦，整合 Google Maps 爬蟲與大語言模型（LLM），可以抓取餐廳詳細資訊、用戶評論，並根據偏好生成個人化推薦。

## 功能
- 餐廳資料擷取：使用 Selenium 自動抓取 Google Maps 上指定範圍內的餐廳訊息，包括：
    - 店名、地址、營業時間
    - 價格範圍、評分、評論數
    - 評論內容抓取與儲存（JSON/CSV）
- RAG 系統整合：
    - 利用 LLM 對抓取的餐廳資訊進行分析
    - 根據使用者問題產生自然語言推薦
    - 支援查詢餐廳評分、特色菜、價格等

## 檔案結構
- `restaurant_data/`：所有餐廳資料及向量文件
- `google_map_crawler/`：Google Map 抓取腳本及 API key
- `src/`：聊天機器人和 RAG 搜尋核心腳本
- `requirement.txt`：Python 依賴
- `README.md`：項目說明

## 使用方式
1. 建立虛擬環境並安裝相依性：
```bash
python -m venv venv

source venv/bin/activate # Windows: venv\Scripts\activate

pip install -r requirement.txt
```