#!/usr/bin/env python3
"""
Scrape carousel images from Home.html and download them to assets/images/carousel1 and carousel2
"""
import os
import re
import requests
from urllib.parse import urlparse

# Paths
INPUT_HTML = 'Home.html'
CAROUSEL1_DIR = 'assets/images/carousel1'
CAROUSEL2_DIR = 'assets/images/carousel2'

# Ensure directories exist
os.makedirs(CAROUSEL1_DIR, exist_ok=True)
os.makedirs(CAROUSEL2_DIR, exist_ok=True)

# Read HTML
with open(INPUT_HTML, 'r', encoding='utf-8') as f:
    html = f.read()

# Extract carousel segments (first two occurrences)
pattern = r'data-autostart="true".*?aria-label="Image carousel">(.*?)</div>'
segments = re.findall(pattern, html, re.DOTALL)

if len(segments) < 2:
    print(f'Found {len(segments)} carousels, expected at least 2.')

# Download images for each carousel
for idx, segment in enumerate(segments[:2]):
    # Find all background-image URLs
    urls = re.findall(r'background-image:\s*url\(&quot;?([^&"\)]+)&quot;?\)', segment)
    target_dir = CAROUSEL1_DIR if idx == 0 else CAROUSEL2_DIR
    print(f"Processing carousel {idx+1} with {len(urls)} images...")
    for i, url in enumerate(urls, start=1):
        parsed = urlparse(url)
        ext = os.path.splitext(parsed.path)[1] or '.jpg'
        filename = f'image_{i}{ext}'
        filepath = os.path.join(target_dir, filename)
        print(f'Downloading {url} -> {filepath}')
        try:
            r = requests.get(url)
            r.raise_for_status()
            with open(filepath, 'wb') as out:
                out.write(r.content)
        except Exception as e:
            print(f'Error downloading {url}: {e}') 