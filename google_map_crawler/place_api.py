import googlemaps
import json
import time
import os
from dotenv import load_dotenv

# 🌱 读取 .env
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
gmaps = googlemaps.Client(key=api_key)

# 📂 数据目录
data_dir = "restaurant_data"
os.makedirs(data_dir, exist_ok=True)

# 📍 中心点与关键字
locations = [
    (22.7245, 120.2857),  # 中央點
    (22.7285, 120.2857),  # 北側
    (22.7205, 120.2857),  # 南側
    (22.7245, 120.2897),  # 東側
    (22.7245, 120.2817),  # 西側
    (22.7285, 120.2897),  # 東北
    (22.7205, 120.2817),  # 西南
]

keywords = ["餐廳","小館","早餐","小吃","飲料","便當","火鍋","燒烤","咖啡","早午餐",
            "粥","快餐","炸物","甜點","宵夜","自助餐","漢堡","義大利麵","披薩","果汁",
            "日式料理","韓式料理","越南料理","泰式料理","印度料理","西式料理","中式料理"]

radius = 4000  # 搜尋半徑

def fetch_nearby_restaurants(locations, keywords, radius=4000):
    """抓取多點、多關鍵字的餐廳資料"""
    all_places_data = []
    seen_place_ids = set()
    
    for location in locations:
        for keyword in keywords:
            print(f"\n📍 掃描位置 {location}，關鍵字「{keyword}」")
            try:
                places_result = gmaps.places_nearby(
                    location=location,
                    radius=radius,
                    keyword=keyword,
                    language="zh-TW"
                )
                while True:
                    for place in places_result.get("results", []):
                        place_id = place["place_id"]
                        if place_id in seen_place_ids:
                            continue
                        seen_place_ids.add(place_id)

                        # 詳細資料
                        attempts = 0
                        max_attempts = 3
                        while attempts < max_attempts:
                            try:
                                place_details = gmaps.place(place_id=place_id, language="zh-TW")
                                break
                            except googlemaps.exceptions.ApiError as e:
                                attempts += 1
                                print(f"⚠️ 詳細資訊錯誤 ({attempts}/{max_attempts})：{e}")
                                time.sleep(2)

                        if place_details and place_details.get("result"):
                            result = place_details["result"]
                            place_data = {
                                "name": result.get("name"),
                                "address": result.get("formatted_address"),
                                "rating": result.get("rating"),
                                "price_level": result.get("price_level"),
                                "formatted_phone_number": result.get("formatted_phone_number"),
                                "website": result.get("website"),
                                "place_id": place_id,
                                "opening_hours": result.get("opening_hours", {}).get("weekday_text") if result.get("opening_hours") else None,
                                "reviews": [
                                    {"author_name": r.get("author_name"),
                                     "rating": r.get("rating"),
                                     "text": r.get("text")}
                                    for r in result.get("reviews", [])[:5]
                                ]
                            }
                            all_places_data.append(place_data)
                            print(f"✅ 已抓取 {place_data['name']}")
                        time.sleep(1)

                    # 下一頁
                    next_page_token = places_result.get("next_page_token")
                    if next_page_token:
                        print("📄 抓下一頁結果...")
                        time.sleep(2)
                        places_result = gmaps.places_nearby(
                            page_token=next_page_token,
                            language="zh-TW"
                        )
                    else:
                        break
            except googlemaps.exceptions.ApiError as e:
                print(f"❌ API 錯誤：{e}")
    return all_places_data

def save_to_json(data, filename="restaurant_near_nuk.json"):
    """存成 JSON"""
    output_file = os.path.join(data_dir, filename)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"\n🎉 共收集 {len(data)} 家店，已儲存至 {output_file}")

if __name__ == "__main__":
    restaurants = fetch_nearby_restaurants(locations, keywords, radius)
    save_to_json(restaurants)
