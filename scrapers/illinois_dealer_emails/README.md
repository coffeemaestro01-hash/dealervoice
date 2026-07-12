# Illinois dealer email scraper

Async Playwright scraper that harvests Illinois dealership listings and extracts contact emails from dealer websites.

## Important: NIADA directory scope

The URL `https://members.niada.com/aecdirectory` is NIADA's **State Affiliates Directory** (one entry per state association, e.g. "Illinois IADA"), not a list of every Illinois rooftop. The script implements the NIADA flow exactly as specified (Illinois filter + pagination + detail pages).

For **individual franchised Illinois dealers** (hundreds of pages), use the supplemental IADA source:

```bash
python scrape_illinois_dealers.py --source iada
```

Combine both:

```bash
python scrape_illinois_dealers.py --source niada --source iada
```

## Install

```bash
cd scrapers/illinois_dealer_emails
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

## Run

```bash
# Default: NIADA Illinois filter + email crawl
python scrape_illinois_dealers.py

# Franchised IL dealers (Illinois Automobile Dealers Association directory)
python scrape_illinois_dealers.py --source iada --max-pages 5

# Limit dealers for a test run
python scrape_illinois_dealers.py --source iada --max-dealers 10 --concurrency 2

# Visible browser (debug)
python scrape_illinois_dealers.py --headed
```

Output: `illinois_dealers_emails.csv`
