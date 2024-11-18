import puppeteer from 'puppeteer';

(async () => {
  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Go to Airbnb homepage
  await page.goto('https://www.airbnb.com/', { waitUntil: 'networkidle2' });

  // Step 1: Type the destination (1st input field)
  console.log("Entering destination...");
  await page.waitForSelector('input[placeholder="Search destinations"]');
  await page.type('input[placeholder="Search destinations"]', 'Europe', { delay: 100 });

  // Wait for a bit to let suggestions load
  await new Promise(resolve => setTimeout(resolve, 2000));  // Use setTimeout for waiting

  // Close suggestions by clicking outside the input field
  await page.click('body');

  // Step 2: Click on "Check-in" (2nd input field) and select a date
  console.log("Selecting check-in date...");
  await page.waitForSelector('input[placeholder="Add dates"]');
  await page.click('input[placeholder="Add dates"]');

  // Select the check-in date (For example, September 24th)
  await page.waitForSelector('td[data-testid="datepicker-day-24"]');
  await page.click('td[data-testid="datepicker-day-24"]');

  // Step 3: Click on the check-out field and select a date (3rd input field)
  console.log("Selecting check-out date...");
  await new Promise(resolve => setTimeout(resolve, 1000));  // Wait for 1 second
  await page.waitForSelector('td[data-testid="datepicker-day-25"]');
  await page.click('td[data-testid="datepicker-day-25"]');

  // Step 4: Input number of guests (4th input field)
  console.log("Adding guests...");
  await page.waitForSelector('input[placeholder="Add guests"]');
  await page.click('input[placeholder="Add guests"]');

  // Increase guests to 2
  await page.waitForSelector('button[aria-label="increase adults"]');
  await page.click('button[aria-label="increase adults"]');

  // Step 5: Submit the search
  console.log("Submitting search...");
  await page.waitForSelector('button[type="submit"]');
  await page.click('button[type="submit"]');

  // Wait for the search results to load
  await page.waitForNavigation();

  // Capture the search URL
  const searchURL = page.url();
  console.log("Airbnb search URL:", searchURL);

  // Close the browser
  await browser.close();
})();
