import requests
from urllib.parse import quote

BASE_URL = "https://web.ainur.app/proxy"
COMPANY_ID = "58c872aa3ce7d5fc688b49bd"
TIMEZONE = "7200"
SESSION_COOKIE = "s%3AP7kOlTJz7HDSMilUU2ZW4lyGKQc6ZEIm.PiVrOH1qUMyYIqxNPeEQupxlHccJedPkIHoKMwookiQ"

HEADERS = {
    'accept': 'application/json',
    'api': 'v3',
    'content-type': 'application/json',
}

COOKIES = {
    'connect.sid': SESSION_COOKIE
}

print("Testing Ainur API connection...")
path = f"/data/{COMPANY_ID}/stores"
encoded_path = quote(path, safe='')
url = f"{BASE_URL}?path={encoded_path}&timezone={TIMEZONE}"

try:
    response = requests.get(url, headers=HEADERS, cookies=COOKIES, timeout=30)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Success: {data.get('status')}")
        if data.get('status'):
            stores = data.get('data', [])
            print(f"Stores found: {len(stores)}")
            for s in stores[:3]:
                print(f"  - {s.get('name')}")
        else:
            print(f"API Error: {data}")
    else:
        print(f"HTTP Error: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")
