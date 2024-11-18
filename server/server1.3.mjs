// server.js (Node.js + Puppeteer)

import puppeteer from 'puppeteer';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());  // Enable CORS to allow communication between the front-end and the back-end
// Utility function to wait for a specific timeout
function waitForTimeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// Route to get the RSS feed from the search URL
app.get('/get-rss', async (req, res) => {
  const { searchUrl } = req.query;  // Get the search URL from the request query

  try {
    const browser = await puppeteer.launch({
      headless: false, // Set to false for interactive mode
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']  // You can add more args if needed
    });
    const page = await browser.newPage();

    // Go to the login page of RSS.app
  await page.goto('https://rss.app/signin', { waitUntil: 'networkidle2' });

  // Fill in the login form (update the credentials below)
  // Wait for the email field, and then type in the credentials
  await page.waitForSelector('input[placeholder="Email address"]');
  await page.type('input[placeholder="Email address"]', 'shangefagansf@outlook.com'); // Replace with your email
  await page.waitForSelector('input[placeholder="Password"]');
  await page.type('input[placeholder="Password"]', 'Bubbob20'); // Replace with your password
    
    
  // Click the submit button and wait for navigation
    await page.click('button[type="submit"]');

  // Wait for the navigation after login
  await page.waitForNavigation({ waitUntil: 'networkidle2' });


    // Go to the RSS generator website with the search URL
    await page.goto(`https://rss.app/new-rss-feed/rss-builder`);
    await page.waitForSelector('input[placeholder="Enter Webpage URL"]');
  await page.type('input[placeholder="Enter Webpage URL"]', searchUrl); 

  await page.evaluate(() => {
    // Find the button with the inner text 'Load Website'
    const buttons = [...document.querySelectorAll('h6')];  // Get all h6 elements
    const loadButton = buttons.find(button => button.textContent.trim() === 'Load Website');
    if (loadButton) {
      loadButton.click();  // Click on the button
    } else {
      console.log('Load Website button not found');
    }
  });
  await waitForTimeout(25000);
  // Define the element selector for the "Got it" button in the popup
  //await page.waitForSelector('input[aria-label="Close"]', { timeout: 10000 });  // Adjust selector accordingly
//const popupSelector = 'div > div > div > section > div > div > div > div > div > div > section > div > a';  // Assuming the button has this aria-label or class
//await page.click(popupSelector);
// Check if the popup with the "Got it" button is present
//const popupButton = await page.$(popupSelector);

//if (popupButton) {
    console.log('Popup detected. Going back and retrying...');
    await page.reload({ waitUntil: 'networkidle2' });  // Reload the page instead of going back

    // Wait for the page to reload
await waitForTimeout(25000);  // Adjust timeout if needed
// Click on a specific location (left: 50px, top: 350px)
await page.mouse.click(50, 350);  // X: 50px from the left, Y: 350px from the top

await page.reload({ waitUntil: 'networkidle2' });  
await waitForTimeout(25000);  // Adjust timeout if needed
// Click on a specific location (left: 50px, top: 350px)
await page.mouse.click(50, 350);  // X: 50px from the left, Y: 350px from the top

await page.reload({ waitUntil: 'networkidle2' });  
await waitForTimeout(25000);  // Adjust timeout if needed
// Click on a specific location (left: 50px, top: 350px)
await page.mouse.click(50, 350);

await page.reload({ waitUntil: 'networkidle2' });  
await waitForTimeout(25000);  // Adjust timeout if needed
// Click on a specific location (left: 50px, top: 350px)
await page.mouse.click(50, 350);
console.log('Clicked on specific coordinates: Left 50px, Top 350px');

    // Click 'Generate RSS' button if needed
// Click the submit button and wait for navigation
await page.click('button[type="submit"]');

    // Wait for RSS feed to be generated or retry
    let rssGenerated = false;
    let retries = 0;
    const maxRetries = 3;

    while (!rssGenerated && retries < maxRetries) {
      try {
        // Wait for the feed URL to be generated
        await page.waitForSelector('input[aria-invalid="false"][autocomplete="off"]', { timeout: 10000 });  // Adjust selector accordingly
        rssGenerated = true;  // If we reach here, feed was generated
      } catch (err) {
        // If the feed is not generated, retry
        console.log(`Retrying feed generation... Attempt ${retries + 1}`);
        await page.reload({ waitUntil: 'networkidle2' });
        await page.click(elementSelector);  // Click the top-left element to select it (adjust the selector accordingly)
        await page.click('button[type="submit"]');  // Retry generating feed
        retries++;
      }
    }
    if (rssGenerated) {
      // Extract the RSS feed URL from the page
      const rssUrl = await page.evaluate(() => {
        return document.querySelector('input[aria-invalid="false"][autocomplete="off"]').value;  // Update this to match the RSS URL display
      });

      await browser.close();

      // Send back the RSS feed URL
      res.json({ rssUrl });
    } else {
      throw new Error('Failed to generate RSS feed after maximum retries');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch the RSS feed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
