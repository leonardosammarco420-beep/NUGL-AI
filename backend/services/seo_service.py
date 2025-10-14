from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

@router.get("/sitemap.xml")
async def get_sitemap():
    """Generate XML sitemap for SEO"""
    base_url = "https://nugl.com"
    
    urls = [
        {'loc': f"{base_url}/", 'changefreq': 'daily', 'priority': '1.0'},
        {'loc': f"{base_url}/news", 'changefreq': 'hourly', 'priority': '0.9'},
        {'loc': f"{base_url}/strains", 'changefreq': 'weekly', 'priority': '0.8'},
        {'loc': f"{base_url}/seeds", 'changefreq': 'weekly', 'priority': '0.8'},
        {'loc': f"{base_url}/nft-marketplace", 'changefreq': 'daily', 'priority': '0.8'},
        {'loc': f"{base_url}/chat", 'changefreq': 'monthly', 'priority': '0.7'},
        {'loc': f"{base_url}/wallet", 'changefreq': 'monthly', 'priority': '0.7'},
        {'loc': f"{base_url}/shop", 'changefreq': 'daily', 'priority': '0.8'},
        {'loc': f"{base_url}/portfolio", 'changefreq': 'daily', 'priority': '0.7'},
    ]
    
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for url in urls:
        xml_content += '  <url>\n'
        xml_content += f'    <loc>{url["loc"]}</loc>\n'
        xml_content += f'    <lastmod>{datetime.now(timezone.utc).date().isoformat()}</lastmod>\n'
        xml_content += f'    <changefreq>{url["changefreq"]}</changefreq>\n'
        xml_content += f'    <priority>{url["priority"]}</priority>\n'
        xml_content += '  </url>\n'
    
    xml_content += '</urlset>'
    
    return xml_content

@router.get("/robots.txt")
async def get_robots():
    """Generate robots.txt for SEO"""
    content = """User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://nugl.com/sitemap.xml
"""
    return content