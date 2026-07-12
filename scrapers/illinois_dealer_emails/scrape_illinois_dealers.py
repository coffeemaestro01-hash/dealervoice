#!/usr/bin/env python3
"""
Illinois car dealership directory harvester + async email extractor.

Step 1: Playwright harvest from NIADA (and optionally IADA) directories.
Step 2: Concurrent deep crawl of dealer websites for contact emails.
Step 3: CSV output -> illinois_dealers_emails.csv
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import logging
import random
import re
from dataclasses import dataclass, field
from typing import Iterable
from urllib.parse import urljoin, urlparse

from playwright.async_api import (
    Browser,
    BrowserContext,
    Page,
    TimeoutError as PlaywrightTimeout,
    async_playwright,
)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

NIADA_ILLINOIS_URL = "https://members.niada.com/aecdirectory/findstartswith?term=Illinois"
NIADA_DIRECTORY_URL = "https://members.niada.com/aecdirectory"
IADA_DIRECTORY_URL = "https://illinoisdealers.com/member-directory/"

OUTPUT_CSV = "illinois_dealers_emails.csv"
CSV_HEADERS = [
    "Dealership Name",
    "City",
    "Website URL",
    "Extracted Emails (Comma Separated)",
    "Source Page URL",
]

CONTACT_PATH_FRAGMENTS = (
    "/contact",
    "/contact-us",
    "/about",
    "/our-team",
    "/meet-the-staff",
    "/privacy-policy",
)

USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
]

EMAIL_REGEX = re.compile(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b")
OBFUSCATED_PATTERNS = [
    re.compile(r"([\w.+-]+)\s*\[at\]\s*([\w.-]+\.\w+)", re.I),
    re.compile(r"([\w.+-]+)\s*\(at\)\s*([\w.-]+\.\w+)", re.I),
    re.compile(r"([\w.+-]+)\s+at\s+([\w.-]+\.\w+)", re.I),
]

SKIP_EMAIL_LOCAL = ("noreply", "no-reply", "donotreply", "privacy", "abuse", "postmaster")
SKIP_EMAIL_DOMAIN = ("sentry.io", "wixpress.com", "example.com", "schema.org", "cloudflare.com")

CAPTCHA_HINTS = (
    "captcha",
    "recaptcha",
    "hcaptcha",
    "verify you are human",
    "bot detection",
    "access denied",
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("il-dealer-scraper")


@dataclass
class DealerListing:
    """Directory row before email crawl."""

    name: str
    city: str
    website_url: str
    directory_source: str = "niada"


@dataclass
class DealerResult:
    """Final row written to CSV."""

    name: str
    city: str
    website_url: str
    emails: set[str] = field(default_factory=set)
    source_pages: set[str] = field(default_factory=set)

    def to_csv_row(self) -> dict[str, str]:
        return {
            "Dealership Name": self.name,
            "City": self.city,
            "Website URL": self.website_url,
            "Extracted Emails (Comma Separated)": ", ".join(sorted(self.emails)),
            "Source Page URL": "; ".join(sorted(self.source_pages)),
        }


# ---------------------------------------------------------------------------
# Email parsing helpers
# ---------------------------------------------------------------------------


def normalize_url(url: str) -> str:
    url = url.strip()
    if not url:
        return url
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url


def is_usable_email(email: str) -> bool:
    e = email.lower().strip(".")
    if "@" not in e or len(e) > 120:
        return False
    local, _, domain = e.partition("@")
    if any(local.startswith(p) for p in SKIP_EMAIL_LOCAL):
        return False
    if any(frag in domain for frag in SKIP_EMAIL_DOMAIN):
        return False
    if re.search(r"\.(png|jpg|jpeg|gif|svg|webp)$", domain):
        return False
    return True


def extract_emails_from_text(text: str) -> set[str]:
    found: set[str] = set()
    for match in EMAIL_REGEX.findall(text):
        if is_usable_email(match):
            found.add(match.lower())
    for pattern in OBFUSCATED_PATTERNS:
        for local, domain in pattern.findall(text):
            candidate = f"{local}@{domain}".lower()
            if is_usable_email(candidate):
                found.add(candidate)
    return found


def parse_city_from_address(address: str) -> str:
    """Parse '123 Main St, Springfield, IL 62701' -> Springfield."""
    if not address:
        return ""
    parts = [p.strip() for p in address.split(",")]
    if len(parts) >= 3:
        return parts[-2]
    if len(parts) == 2:
        return parts[0]
    return ""


# ---------------------------------------------------------------------------
# Playwright context helpers
# ---------------------------------------------------------------------------


async def new_context(browser: Browser, headed: bool) -> BrowserContext:
    ua = random.choice(USER_AGENTS)
    return await browser.new_context(
        user_agent=ua,
        viewport={"width": 1366, "height": 900},
        locale="en-US",
        java_script_enabled=True,
    )


async def safe_goto(page: Page, url: str, timeout_ms: int = 45_000) -> bool:
    try:
        response = await page.goto(url, wait_until="domcontentloaded", timeout=timeout_ms)
        # Cloudflare / GrowthZone widgets may hydrate late
        try:
            await page.wait_for_load_state("networkidle", timeout=12_000)
        except PlaywrightTimeout:
            pass
        await page.wait_for_timeout(random.randint(600, 1200))
        if response and response.status >= 400:
            log.warning("HTTP %s for %s", response.status, url)
            return False
        return True
    except PlaywrightTimeout:
        log.warning("Timeout loading %s", url)
        return False
    except Exception as exc:  # noqa: BLE001 — per-domain fail-safe
        log.warning("Failed to load %s: %s", url, exc)
        return False


def page_likely_blocked(html: str) -> bool:
    lower = html.lower()
    return any(hint in lower for hint in CAPTCHA_HINTS)


# ---------------------------------------------------------------------------
# Step 1: NIADA directory harvesting
# ---------------------------------------------------------------------------


async def harvest_niada_illinois(page: Page) -> list[DealerListing]:
    """
    Navigate NIADA State Affiliates directory filtered to Illinois.
    Paginates while a enabled 'Next' control exists.
    """
    listings: list[DealerListing] = []
    start_urls = [NIADA_ILLINOIS_URL, NIADA_DIRECTORY_URL]

    for start in start_urls:
        if not await safe_goto(page, start):
            continue

        # Try to apply Illinois via search box if present (GrowthZone widget).
        try:
            search = page.locator(
                'input[type="search"], input[name*="search" i], input[placeholder*="Search" i]'
            ).first
            if await search.count():
                await search.fill("Illinois")
                await search.press("Enter")
                await page.wait_for_timeout(1500)
        except Exception:  # noqa: BLE001
            pass

        page_num = 1
        while True:
            log.info("NIADA directory page %s — %s", page_num, page.url)
            batch = await _parse_niada_listing_cards(page)
            listings.extend(batch)

            next_btn = page.locator(
                'a:has-text("Next"), button:has-text("Next"), '
                'a[aria-label="Next"], li.next a, .pagination-next a'
            ).first

            if not await next_btn.count():
                break

            disabled = await next_btn.get_attribute("aria-disabled")
            class_name = (await next_btn.get_attribute("class")) or ""
            if disabled == "true" or "disabled" in class_name.lower():
                break

            try:
                await next_btn.click()
                await page.wait_for_load_state("domcontentloaded")
                await page.wait_for_timeout(random.randint(800, 1500))
            except Exception as exc:  # noqa: BLE001
                log.info("NIADA pagination stopped: %s", exc)
                break

            page_num += 1
            if page_num > 200:
                break

        if listings:
            break

    # Enrich from detail pages (Visit Website, city from address).
    enriched: list[DealerListing] = []
    seen: set[str] = set()
    for item in listings:
        key = (item.name.lower(), item.website_url.lower())
        if key in seen:
            continue
        seen.add(key)
        enriched.append(item)

    detail_links = await page.locator('a[href*="/aecdirectory/Details/"]').all()
    for link in detail_links[:50]:
        try:
            href = await link.get_attribute("href")
            if not href:
                continue
            detail_url = urljoin(page.url, href)
            detail = await _parse_niada_detail_page(page, detail_url)
            if detail and detail.website_url:
                key = (detail.name.lower(), detail.website_url.lower())
                if key not in seen:
                    seen.add(key)
                    enriched.append(detail)
        except Exception as exc:  # noqa: BLE001
            log.debug("Detail skip: %s", exc)

    return enriched


async def _parse_niada_listing_cards(page: Page) -> list[DealerListing]:
    """Extract dealer cards from current NIADA results page."""
    listings: list[DealerListing] = []
    html = await page.content()

    # GrowthZone cards often use h5/h4 headings + address lines with ", IL"
    cards = page.locator("article, .gz-list-card, .mn-listing, .listing-card, .directory-result")
    count = await cards.count()
    if count == 0:
        # Fallback: treat each Details link block as a listing
        headings = page.locator("h4, h5, h3").filter(has_text=re.compile(r".+", re.I))
        h_count = await headings.count()
        for i in range(h_count):
            try:
                heading = headings.nth(i)
                name = (await heading.inner_text()).strip()
                if not name or len(name) < 3:
                    continue
                container = heading.locator("xpath=ancestor::*[self::article or self::div][1]")
                text = await container.inner_text() if await container.count() else await heading.inner_text()
                if ", IL" not in text and "Illinois" not in text and "illinois" not in name.lower():
                    continue
                website = ""
                visit = container.locator('a:has-text("Visit Website")').first
                if await visit.count():
                    website = (await visit.get_attribute("href")) or ""
                city = parse_city_from_address(text)
                if name and website:
                    listings.append(
                        DealerListing(name=name, city=city, website_url=normalize_url(website), directory_source="niada")
                    )
            except Exception:  # noqa: BLE001
                continue
        return listings

    for i in range(count):
        card = cards.nth(i)
        try:
            text = await card.inner_text()
            if ", IL" not in text and "Illinois" not in text:
                continue
            name_el = card.locator("h3, h4, h5, .listing-name, .gz-card-title").first
            name = (await name_el.inner_text()).strip() if await name_el.count() else ""
            if not name:
                continue
            website = ""
            for sel in ('a:has-text("Visit Website")', 'a[href*="http"]:has-text("Website")'):
                link = card.locator(sel).first
                if await link.count():
                    website = (await link.get_attribute("href")) or ""
                    break
            city = parse_city_from_address(text)
            if website:
                listings.append(
                    DealerListing(name=name, city=city, website_url=normalize_url(website), directory_source="niada")
                )
        except Exception:  # noqa: BLE001
            continue

    if not listings and ", IL" in html:
        log.warning("NIADA page has IL content but no cards parsed — site may be state-affiliate only.")

    return listings


async def _parse_niada_detail_page(page: Page, detail_url: str) -> DealerListing | None:
    if not await safe_goto(page, detail_url):
        return None
    title = page.locator("h1, h2").first
    name = (await title.inner_text()).strip() if await title.count() else ""
    body = await page.inner_text("body")
    if ", IL" not in body and "illinois" not in name.lower():
        return None
    website = ""
    visit = page.locator('a:has-text("Visit Website")').first
    if await visit.count():
        website = (await visit.get_attribute("href")) or ""
    if not website:
        # Some profiles expose bare domain text
        domain_match = re.search(r"\b([a-z0-9.-]+\.(?:org|com|net))\b", body, re.I)
        if domain_match:
            website = normalize_url(domain_match.group(1))
    city = parse_city_from_address(body)
    if name and website:
        return DealerListing(name=name, city=city, website_url=normalize_url(website), directory_source="niada")
    return None


# ---------------------------------------------------------------------------
# Step 1b: IADA member directory (franchised IL dealers — optional source)
# ---------------------------------------------------------------------------


async def harvest_iada_directory(page: Page, max_pages: int = 66) -> list[DealerListing]:
    """
    Illinois Automobile Dealers Association member directory.
    Paginates numbered pages (1..N) until max_pages or no next control.
    """
    listings: list[DealerListing] = []
    if not await safe_goto(page, IADA_DIRECTORY_URL):
        return listings

    for page_num in range(1, max_pages + 1):
        if page_num > 1:
            # Try numbered pagination links or » next
            next_sel = page.locator(f'a:has-text("{page_num}")').first
            if await next_sel.count():
                await next_sel.click()
            else:
                next_arrow = page.locator('a:has-text("»"), a:has-text("Next")').first
                if not await next_arrow.count():
                    break
                await next_arrow.click()
            await page.wait_for_load_state("domcontentloaded")
            await page.wait_for_timeout(random.randint(700, 1400))

        log.info("IADA directory page %s", page_num)
        batch = await _parse_iada_page(page)
        if not batch and page_num > 1:
            break
        listings.extend(batch)

    return listings


async def _parse_iada_page(page: Page) -> list[DealerListing]:
    listings: list[DealerListing] = []
    # Member blocks: name heading + address line; website often in outbound link on name
    entries = page.locator("h4, h5, .member-name, strong").filter(has_text=re.compile(r".+", re.I))
    count = await entries.count()
    for i in range(count):
        try:
            el = entries.nth(i)
            name = (await el.inner_text()).strip()
            if len(name) < 4 or name.lower() in ("join iada", "search for a member or location"):
                continue
            parent = el.locator("xpath=ancestor::div[1]")
            block_text = await parent.inner_text() if await parent.count() else name
            lines = [ln.strip() for ln in block_text.splitlines() if ln.strip()]
            address = next((ln for ln in lines if re.search(r"\bIL\b|\d{5}", ln)), "")
            city = parse_city_from_address(address.replace(" IL ", ", IL, "))

            website = ""
            link = el.locator("xpath=ancestor-or-self::a").first
            if await link.count():
                href = await link.get_attribute("href")
                if href and href.startswith("http"):
                    website = href

            if not website:
                ext = parent.locator('a[href^="http"]').first
                if await ext.count():
                    website = (await ext.get_attribute("href")) or ""

            if name:
                listings.append(
                    DealerListing(
                        name=name,
                        city=city,
                        website_url=normalize_url(website) if website else "",
                        directory_source="iada",
                    )
                )
        except Exception:  # noqa: BLE001
            continue
    return listings


# ---------------------------------------------------------------------------
# Step 2: Deep domain scraping & email extraction
# ---------------------------------------------------------------------------


async def discover_contact_urls(page: Page, base_url: str) -> list[str]:
    """Homepage + contact-like links found in DOM."""
    urls: list[str] = []
    if await safe_goto(page, base_url):
        urls.append(page.url)
        anchors = page.locator("a[href]")
        count = await anchors.count()
        base_host = urlparse(base_url).netloc
        for i in range(min(count, 400)):
            try:
                href = await anchors.nth(i).get_attribute("href")
                if not href:
                    continue
                full = urljoin(base_url, href)
                parsed = urlparse(full)
                if parsed.netloc and parsed.netloc != base_host:
                    continue
                path = (parsed.path or "").lower()
                if any(fragment in path for fragment in CONTACT_PATH_FRAGMENTS):
                    if full not in urls:
                        urls.append(full)
            except Exception:  # noqa: BLE001
                continue

    # Also probe common paths even if not linked
    for fragment in CONTACT_PATH_FRAGMENTS:
        candidate = urljoin(base_url.rstrip("/") + "/", fragment.lstrip("/"))
        if candidate not in urls:
            urls.append(candidate)

    # De-dupe preserving order
    seen: set[str] = set()
    ordered: list[str] = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            ordered.append(u)
    return ordered[:12]


async def extract_emails_from_page(page: Page, url: str) -> tuple[set[str], bool]:
    """Returns (emails, blocked)."""
    if not await safe_goto(page, url):
        return set(), False
    html = await page.content()
    if page_likely_blocked(html):
        log.warning("Possible CAPTCHA/block at %s", url)
        return set(), True
    emails = extract_emails_from_text(html)
    # mailto: links
    mailtos = page.locator('a[href^="mailto:"]')
    mcount = await mailtos.count()
    for i in range(mcount):
        try:
            href = await mailtos.nth(i).get_attribute("href")
            if not href:
                continue
            addr = href.split("mailto:")[-1].split("?")[0].strip()
            if is_usable_email(addr):
                emails.add(addr.lower())
        except Exception:  # noqa: BLE001
            continue
    return emails, False


async def scrape_dealer_emails(
    context: BrowserContext,
    listing: DealerListing,
    sem: asyncio.Semaphore,
) -> DealerResult:
    result = DealerResult(
        name=listing.name,
        city=listing.city,
        website_url=listing.website_url,
    )
    if not listing.website_url:
        return result

    async with sem:
        await asyncio.sleep(random.uniform(1.0, 3.0))
        page = await context.new_page()
        try:
            contact_urls = await discover_contact_urls(page, listing.website_url)
            for url in contact_urls:
                try:
                    emails, blocked = await extract_emails_from_page(page, url)
                    if blocked:
                        break
                    if emails:
                        result.emails.update(emails)
                        result.source_pages.add(url)
                    await asyncio.sleep(random.uniform(0.3, 0.8))
                except Exception as exc:  # noqa: BLE001
                    log.warning("[%s] subpage error %s: %s", listing.name, url, exc)
        except Exception as exc:  # noqa: BLE001
            log.warning("[%s] domain scrape failed: %s", listing.name, exc)
        finally:
            await page.close()

    log.info(
        "[%s] %s email(s) from %s",
        listing.name,
        len(result.emails),
        listing.website_url,
    )
    return result


async def worker(
    queue: asyncio.Queue[DealerListing | None],
    context: BrowserContext,
    sem: asyncio.Semaphore,
    results: list[DealerResult],
    lock: asyncio.Lock,
) -> None:
    while True:
        item = await queue.get()
        try:
            if item is None:
                return
            row = await scrape_dealer_emails(context, item, sem)
            async with lock:
                results.append(row)
        finally:
            queue.task_done()


# ---------------------------------------------------------------------------
# Step 4: CSV output
# ---------------------------------------------------------------------------


def write_csv(path: str, rows: Iterable[DealerResult]) -> None:
    with open(path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=CSV_HEADERS)
        writer.writeheader()
        for row in rows:
            writer.writerow(row.to_csv_row())
    log.info("Wrote %s", path)


def dedupe_listings(listings: list[DealerListing]) -> list[DealerListing]:
    seen: set[tuple[str, str]] = set()
    out: list[DealerListing] = []
    for d in listings:
        key = (d.name.strip().lower(), d.website_url.strip().lower())
        if not d.website_url or key in seen:
            continue
        seen.add(key)
        out.append(d)
    return out


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


async def run(args: argparse.Namespace) -> None:
    listings: list[DealerListing] = []

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=not args.headed,
            args=["--disable-blink-features=AutomationControlled"],
        )
        context = await new_context(browser, args.headed)
        page = await context.new_page()

        if "niada" in args.source:
            log.info("=== Step 1: NIADA Illinois directory ===")
            niada = await harvest_niada_illinois(page)
            log.info("NIADA listings harvested: %s", len(niada))
            listings.extend(niada)

        if "iada" in args.source:
            log.info("=== Step 1b: IADA member directory (franchised IL) ===")
            iada = await harvest_iada_directory(page, max_pages=args.max_pages)
            log.info("IADA listings harvested: %s", len(iada))
            listings.extend(iada)

        await page.close()

        listings = dedupe_listings(listings)
        if args.max_dealers:
            listings = listings[: args.max_dealers]

        log.info("Unique dealers with websites: %s", len(listings))
        if not listings:
            log.warning("No listings harvested — check directory selectors or use --source iada")
            await browser.close()
            write_csv(args.output, [])
            return

        log.info("=== Step 2: Email extraction (%s workers) ===", args.concurrency)
        queue: asyncio.Queue[DealerListing | None] = asyncio.Queue()
        for listing in listings:
            await queue.put(listing)
        for _ in range(args.concurrency):
            await queue.put(None)

        sem = asyncio.Semaphore(args.concurrency)
        results: list[DealerResult] = []
        lock = asyncio.Lock()
        workers = [
            asyncio.create_task(worker(queue, context, sem, results, lock))
            for _ in range(args.concurrency)
        ]
        await queue.join()
        await asyncio.gather(*workers)

        await context.close()
        await browser.close()

    write_csv(args.output, results)
    with_email = sum(1 for r in results if r.emails)
    log.info("Done. %s / %s dealers with at least one email.", with_email, len(results))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Illinois dealer directory + email scraper")
    parser.add_argument(
        "--source",
        action="append",
        choices=["niada", "iada"],
        default=["niada"],
        help="Directory source(s). Default: niada. Add iada for franchised IL dealer list.",
    )
    parser.add_argument("--output", default=OUTPUT_CSV, help="Output CSV path")
    parser.add_argument("--concurrency", type=int, default=4, help="Parallel domain crawls")
    parser.add_argument("--max-dealers", type=int, default=0, help="Limit dealers (0 = all)")
    parser.add_argument("--max-pages", type=int, default=66, help="IADA pagination cap")
    parser.add_argument("--headed", action="store_true", help="Show browser window")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    asyncio.run(run(args))


if __name__ == "__main__":
    main()
