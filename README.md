# 🍜 NUK RAG Food Recommendation System

> An AI-powered restaurant recommendation system for the National University of Kaohsiung (NUK), integrating Google Maps crawling, Retrieval-Augmented Generation (RAG), FastAPI, React, and Google's Gemini API.

---

## 📖 Overview

The **NUK RAG Food Recommendation System** is designed to help students and faculty at the **National University of Kaohsiung (NUK)** discover nearby restaurants through an intelligent conversational interface.

This project combines **Google Maps web crawling**, **Retrieval-Augmented Generation (RAG)**, and **Large Language Models (LLMs)** to provide accurate and context-aware restaurant recommendations. The frontend adopts a modern **Gemini-inspired interface**, while the backend utilizes **FastAPI**, **FAISS**, and the latest **Google GenAI SDK** to support multi-turn conversations and semantic search.

---

## ✨ Features

### 🍽️ Restaurant Data Collection

* Automatically crawls restaurant information from Google Maps using Selenium.
* Collects restaurant names, ratings, addresses, opening hours, phone numbers, price ranges, and user reviews.
* Stores structured restaurant data in both JSON and CSV formats.

### 🧠 Retrieval-Augmented Generation (RAG)

* Uses Google Embedding models to generate semantic vectors.
* Builds a local FAISS vector database for efficient similarity search.
* Retrieves the most relevant restaurant reviews before generating responses.

### 💬 Multi-turn Conversation Memory

* Maintains conversation history across multiple interactions.
* Understands contextual references such as:

  * "What is its phone number?"
  * "Is that restaurant open now?"
  * "Show me another one."

### 🎨 Modern Gemini-style Interface

* Minimalist borderless UI.
* Responsive chat interface.
* Markdown rendering support.
* Structured restaurant recommendation cards.
* Google Maps navigation links.
* Multiple chat session management with LocalStorage persistence.

---

# 🏗️ System Architecture

```text
                 Google Maps
                      │
                      ▼
          Selenium Web Crawler
                      │
             Restaurant Dataset
              (JSON / CSV)
                      │
                      ▼
         Embedding Generation
          (Google Embedding)
                      │
                      ▼
              FAISS Vector DB
                      │
                      ▼
              FastAPI Backend
         (Conversation Memory)
                      │
                 Gemini API
                      │
                      ▼
             React + Vite Frontend
                      │
                      ▼
                    Users
```

---

# 🔄 RAG Workflow

```text
User Question
      │
      ▼
Text Embedding
      │
      ▼
FAISS Similarity Search
      │
      ▼
Retrieve Relevant Reviews
      │
      ▼
Prompt Construction
      │
      ▼
Gemini LLM
      │
      ▼
Restaurant Recommendation
      │
      ▼
Restaurant Cards
```

---

## 🛠️ Tech Stack

| Category        | Technology         |
| --------------- | ------------------ |
| Language        | Python, JavaScript |
| Backend         | FastAPI            |
| Frontend        | React + Vite       |
| AI Model        | Google Gemini      |
| Embedding       | Gemini Embedding   |
| Vector Database | FAISS              |
| Web Crawler     | Selenium           |
| Data Storage    | JSON, CSV          |
| Markdown        | react-markdown     |

---

## 📂 Project Structure

```text
.
├── google_map_crawler/
│   └── crawler.py
│
├── restaurant_data/
│   ├── restaurant_near_nuk.json
│   ├── restaurant.index
│   └── restaurant_texts.npy
│
├── src/
│   ├── api.py
│   └── rag_search.py
│
├── nuk-food-web/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── requirements.txt
├── .env.example
└── README.md
```

---

# 🚀 Installation

## Requirements

* Python 3.10+
* Node.js (Latest LTS recommended)

---

### Clone Repository

```bash
git clone https://github.com/yourname/NUK-RAG-Food-System.git

cd NUK-RAG-Food-System
```

---

### Install Backend

Using Conda

```bash
conda create -n llm_env python=3.10 -y

conda activate llm_env

pip install -r requirements.txt
```

Or using Python virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
```

---

### Configure Environment Variables

Create a `.env` file in the project root.

```env
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
```

---

### Install Frontend

```bash
cd nuk-food-web

npm install
```

---

# 📊 Data Pipeline

## Step 1 – Crawl Restaurant Data

```bash
python google_map_crawler/crawler.py
```

The crawler automatically:

* Launches Selenium WebDriver
* Visits Google Maps
* Collects restaurant information
* Extracts user reviews
* Saves structured data into JSON and CSV files

---

## Step 2 – Build RAG Vector Database

The vector database is generated automatically when the backend starts.

```bash
python -m src.api
```

If no FAISS index exists, the system will:

* Read restaurant data
* Generate embeddings
* Build a FAISS vector index
* Save the index locally

---

# ▶️ Running the Project

## Start Backend

```bash
python -m src.api
```

Backend will run at

```
http://127.0.0.1:8000
```

---

## Start Frontend

```bash
cd nuk-food-web

npm run dev
```

Open your browser and visit

```
http://localhost:5173
```

---

## 📸 Screenshots

> Screenshots will be added in future updates.

---

## 🚧 Future Work

* User preference learning
* Personalized restaurant recommendations
* Mobile-friendly interface
* Cloud deployment
* Docker support
* User authentication
* Restaurant image retrieval
* Voice interaction

---

## ⚠️ Notes

* Never upload your `.env` file.
* Keep your Gemini API key private.
* This crawler is intended for educational and research purposes only.
* Please comply with Google Maps Terms of Service when collecting data.

---

## 📄 License

This project is intended for educational and academic purposes.

Feel free to modify and extend it for learning and research.
