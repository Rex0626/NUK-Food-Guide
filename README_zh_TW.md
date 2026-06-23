# 高大 RAG 美食推薦系統 (NUK RAG Food Guide) 📍

本系統旨在為國立高雄大學師生提供週邊餐飲推薦。專案完整整合了 **Selenium 自動化 Google Maps 爬蟲技術**與**RAG + LLM 架構**。前端採用現代化的類 Gemini 極簡無邊框設計，後端結合 FastAPI 與最新的 Google GenAI SDK，提供具備多輪對話記憶能力與結構化導航卡片的高階美食搜尋體驗。

---

## 🚀 核心功能

### 1. 餐廳資料擷取 (爬蟲模組)
- **自動化抓取**：使用 Selenium 自動抓取 Google Maps 上指定範圍（高雄大學週邊）內的餐廳訊息。
- **完整欄位儲存**：擷取店名、地址、營業時間、價格範圍、評分、評論數，並將豐富的用戶評論內容結構化儲存為 JSON 與 CSV 格式。

### 2. 結構化 RAG 系統整合
- **向量化檢索**：利用 FAISS 向量資料庫與 Embedding 模型，對抓取的餐廳大數據評論進行深度語意分析與精準檢索。
- **動態記憶多輪對話**：後端原生支援傳遞上下文歷史紀錄，AI 能理解「剛才那家店」或「它的電話」等代稱，達成流暢的連續對話。

### 3. Gemini 風格 UI/UX 介面
- **現代化版面**：支援側邊欄平滑收合、左右交錯對話氣泡（使用者靠右、助手靠左），全面移除生硬邊框，改用輕量化陰影營造懸浮現代感。
- **多對話視窗管理**：實作多對話 Session 管理，系統會自動擷取首句發言為對話標題，支援獨立刪除對話與 LocalStorage 持久化紀錄儲存。
- **結構化餐廳卡片**：AI 推薦內容下方會自動渲染橫向捲動的店家細節卡片，內建 Google Maps 官方標準導航連結（透過 place_id 精準定位）與官網直通按鈕。
- **原生 Markdown 渲染**：前端整合 `react-markdown`，完美解析模型產生的粗體與條列式清單排版。

---

## 📄 專案目錄結構

```text
├── google_map_crawler/     # Google Maps 爬蟲腳本模組
├── restaurant_data/        # 原始餐廳 JSON/CSV 資料與 FAISS 向量索引文件
├── src/
│   ├── api.py              # FastAPI 主程式（核心路由與多輪對話記憶調度）
│   └── rag_search.py       # RAG 語意向量檢索核心邏輯
├── nuk-food-web/           # Vite + React 現代化前端專案
│   ├── src/
│   │   ├── App.jsx         # Gemini 風格主介面與結構化卡片渲染元件
│   │   └── main.jsx
│   └── .gitignore
├── .env.example            # 環境變數設定範本
├── .gitignore              # 根目錄 Git 忽略設定
└── requirements.txt        # Python 後端依賴套件清單
```

---

## 📦 安裝與運作指南

本專案分為後端API 服務（含爬蟲資料庫）與前端網頁介面兩部分，請依序完成以下配置：

### 1. 本地環境準備
- 後端環境：Python 3.10+（建議使用Anaconda 管理虛擬環境）
- 前端環境：Node.js（建議使用最新LTS 版本）

### 2. 環境變數設定
請在項目根目錄（與src/同級）下建立一個名為.env的檔案，並填入您的Gemini API 密鑰（注意：此文件已被納入.gitignore，切勿推送到GitHub）：
```
GOOGLE_API_KEY=您的_Gemini_API_Key_字串
```

### 3. 後端大腦與爬蟲環境配置
開啟第一個終端機（Terminal）視窗，執行下列指令建立並啟動虛擬環境，隨後安裝依賴套件：
- 使用Anaconda (推薦)：
```
# 建立專案虛擬環境
conda create -n llm_env python=3.10 -y
# 啟用虛擬環境
conda activate llm_env
# 安裝後端核心套件
pip install google-genai fastapi uvicorn python-dotenv selenium faiss-cpu numpy react-markdown
```
- 使用Python 原生venv：
```
# 建立虛擬環境
python -m venv venv
# 啟用虛擬環境 (Windows)
venv\Scripts\activate
# 啟用虛擬環境 (Mac/Linux)
source venv/bin/activate
# 安裝依賴套件
pip install -r requirements.txt
```

### 4. 前端網頁界面建構
開啟第二個獨立的終端視窗，切換至前端專案文件夾並安裝前端依賴節點：
```
# 進入前端目錄
cd nuk-food-web
# 安裝 React 相關套件
npm install
```

---

## 🔄 資料核心運作流程(爬蟲與RAG 預處理)

本專案的完整資料生命週期包含以下兩個核心獨立流程，請依序執行以建立本地美食資料庫：

### 1. 流程一：執行Google Maps 自動化資料爬取🕷️
若要更新或重新蒐集高雄大學週邊的餐廳資訊，請執行爬蟲模組：
```
python google_map_crawler/crawler.py
```
- **底層運作邏輯**：系統會自動喚醒Selenium WebDriver，模擬真人瀏覽器行為，定位至高雄大學外設坐標，動態滾動並展開各餐廳面板。深度擷取店名、Google 評分、格式化地址、電話、place_id以及數萬字的用戶評論文字。
- **產出目標**：資料將被結構化清洗，並儲存至restaurant_data/restaurant_near_nuk.json。

### 2. 流程二：執行RAG 語義量化預處理與建構🧠
在資料庫就緒後，必須將純文字資料轉化為機器可閱讀的向量索引。本工程採用的RAG 機制支援自動化檢測建立：
```
# 本專案無需手動執行預處理腳本。當您首次啟動後端 API 時，系統會自動觸發預處理邏輯：
python -m src.api
```
- **底層運作邏輯**：src/rag_search.py中的build_or_load_index函數會自動檢查本機目錄。若未偵測到索引檔，系統將呼叫Google Text Embedding 模型，將原始JSON 內的所有餐廳評論與特色描述，編譯成高維度的語義量，並透過FAISS 演算法建立本地二進位向量資料庫。
- **產出目標**：於本地自動產生restaurant.index（向量矩陣）與restaurant_texts.npy（文字對應庫），作為後端即時語意檢索的依據。

---

## 🚀 系統運作與啟動步驟
當前後端環境皆配置完成後，每次啟動專案請執行以下兩項服務：

### 1. 第一步：啟動後端FastAPI 服務
在第一個終端機（確認處於llm_env環境）執行：
```
python -m src.api
```
當看到終端輸出INFO: Uvicorn running on http://127.0.0.1:8000且顯示向量索引已載入，即代表後端啟動成功。

### 2. 第二步：啟動前端React 網頁
在第二個終端機（確認位於nuk-food-web資料夾下）執行：
```
npm run dev
```
啟動後，點擊終端機顯示的網址（通常為http://localhost:5173）即可開啟網頁開始與美食推薦系統對話！

---

## ⚠️ 注意事項與安全規範
- **API 金鑰安全**：請務必確保.env檔案未被Git 追蹤。若不小心上傳金鑰，請立即至Google AI Studio 撤銷該金鑰並重新申請。
- **爬蟲使用規範**：google_map_crawler/內的腳本僅供學術研究與高雄大學校園餐飲資料蒐集使用，執行爬蟲時請遵守Google 相關服務條款。