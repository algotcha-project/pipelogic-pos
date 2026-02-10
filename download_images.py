import json
import os
import requests
from urllib.parse import urlparse
import hashlib

# Directory to save images
IMAGES_DIR = "C:/Users/HDUser/ainur-pos-clone/backend/public/images/products"
PRODUCTS_FILE = "C:/Users/HDUser/ainur-pos-clone/extracted_data/products.json"

# Create directory if not exists
os.makedirs(IMAGES_DIR, exist_ok=True)

def download_image(url, save_path):
    """Download an image from URL and save it locally"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
        else:
            print(f"Failed to download {url}: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def get_filename_from_url(url):
    """Extract filename from URL"""
    parsed = urlparse(url)
    path = parsed.path
    filename = os.path.basename(path)
    return filename

def main():
    # Load products
    print("Loading products...")
    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    print(f"Found {len(products)} products")
    
    # Collect all image URLs
    image_urls = []
    product_image_map = {}  # Map product_id -> [local_filenames]
    
    for product in products:
        product_id = product.get('_id')
        pics = product.get('pic', [])
        if pics:
            product_image_map[product_id] = []
            for pic_url in pics:
                if pic_url and pic_url.startswith('http'):
                    image_urls.append((product_id, pic_url))
    
    print(f"Found {len(image_urls)} images to download")
    
    # Download images
    downloaded = 0
    failed = 0
    url_to_local = {}  # Map original URL -> local filename
    
    for i, (product_id, url) in enumerate(image_urls):
        filename = get_filename_from_url(url)
        if not filename:
            # Create hash-based filename
            filename = hashlib.md5(url.encode()).hexdigest() + '.jpg'
        
        save_path = os.path.join(IMAGES_DIR, filename)
        
        # Skip if already downloaded
        if os.path.exists(save_path):
            print(f"[{i+1}/{len(image_urls)}] Already exists: {filename}")
            url_to_local[url] = filename
            downloaded += 1
            continue
        
        print(f"[{i+1}/{len(image_urls)}] Downloading: {filename}")
        if download_image(url, save_path):
            url_to_local[url] = filename
            downloaded += 1
        else:
            failed += 1
        
        # Progress update every 100 images
        if (i + 1) % 100 == 0:
            print(f"Progress: {i+1}/{len(image_urls)} ({downloaded} downloaded, {failed} failed)")
    
    print(f"\nDownload complete!")
    print(f"Downloaded: {downloaded}")
    print(f"Failed: {failed}")
    
    # Save URL mapping for later use
    mapping_file = os.path.join(IMAGES_DIR, '..', 'url_mapping.json')
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(url_to_local, f, indent=2)
    print(f"URL mapping saved to {mapping_file}")

if __name__ == '__main__':
    main()
