// airbnbSearch.cjs
const puppeteer = require('puppeteer');

// Your code here



(async () => {
  // Launch the browser
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Go to Airbnb's homepage
  await page.goto('https://www.airbnb.com/');

  // Wait for the search input field to be visible
  await page.waitForSelector('input[name="query"]'); // The "Where" field

  // Input the destination, dates, and guests
  await page.type('input[name="query"]', 'Europe'); // Destination
  await page.click('div[data-testid="structured-search-input-field-split-dates-0"]'); // Date selection
  await page.click('td[data-testid="datepicker-day-10"]'); // Start date
  await page.click('td[data-testid="datepicker-day-20"]'); // End date
  await page.click('div[data-testid="structured-search-input-field-guests-button"]'); // Guests
  await page.click('button[data-testid="stepper-adults-increase-button"]'); // Increment adults

  // Click the search button
  await page.click('button[type="submit"]');

  // Wait for the search results page to load
  await page.waitForNavigation();

  // Capture the current URL of the search results
  const searchURL = page.url();
  console.log("Airbnb search URL:", searchURL);

  // Close the browser
  await browser.close();
})();
