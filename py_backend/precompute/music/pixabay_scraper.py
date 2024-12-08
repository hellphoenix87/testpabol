import time
from playwright.sync_api import sync_playwright
import json
import os
from multiprocessing.pool import ThreadPool
import hashlib


# This scraper downloads all cinematic tracks from pixabay.

save_folder = "downloads"


def scrape_page(page_id):
    with sync_playwright() as playwright:
        # open new browser context and go to desired page
        browser = playwright.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto(f"https://pixabay.com/music/search/cinematic/?pagi={page_id}")

        # click "Accept All Cookies"
        page.get_by_role("button", name="Accept All Cookies").click()

        # get all elements with class "container--VjgKO"
        elements = page.query_selector_all(".container--VjgKO")

        print("elements found: " + str(len(elements)))

        for element in elements:
            # find the div with class "tags--kPTWa"
            div = element.query_selector(".tags--kPTWa")

            # the div contains many <a> tags
            # copy all string information, e.g. "background" in <a href="/music/search/background/">background</a>
            # and save it to a list
            tags = []
            for a in div.query_selector_all("a"):
                tags.append(a.inner_text())

            print("tags: " + str(tags))

            title = element.query_selector(".name--q8l1g").inner_text()

            print("title: " + title)

            # hash tags and title to get unique id str with length 8
            id_str = hashlib.sha256((title + str(tags)).encode("utf-8")).hexdigest()[:8]
            mp3_filename = save_folder + "/" + id_str + ".mp3"
            json_filename = save_folder + "/" + id_str + ".json"

            # if both files already exist, skip
            # This prevents downloading the same file multiple times, if the scraper crashed and needs a restart
            if os.path.isfile(mp3_filename) and os.path.isfile(json_filename):
                print("skipping " + id_str)
                continue

            time.sleep(2)

            # click download button and expect download
            with page.expect_download() as download_info:
                # click "Download" button
                element.query_selector(".buttonBase--r4opq").click()
            download = download_info.value
            download.save_as(mp3_filename)

            # click button with class "close--+Fj1i" on the page to close modal
            page.get_by_role("button", name="Close").click()

            # save title and tags to json file
            with open(json_filename, "w") as f:
                json.dump({"title": title, "tags": tags}, f)

        context.close()
        browser.close()


# params
os.makedirs(save_folder, exist_ok=True)

thread_pool_size = 4
# check manually and enter total number of pages here
num_pages = 529
if False:  # single threaded
    for page_id in range(1, num_pages):
        scrape_page(page_id)
else:
    with ThreadPool(thread_pool_size) as pool:
        pool.map(scrape_page, range(1, num_pages))
