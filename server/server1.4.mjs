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

// Function to generate the dynamic RSS URL based on user input
function generateRssUrl(searchUrl) {
  // Extract parameters from the user input (e.g., searchUrl)
  const urlParams = new URLSearchParams(searchUrl);

  const checkin = urlParams.get('checkin') || '2024-09-25';
  const checkout = urlParams.get('checkout') || '2024-09-26';
  const adults = urlParams.get('adults') || '2';
  const placeId = urlParams.get('place_id') || 'ChIJU1NoiDs6BIQREZgJa760ZO0';  // Default place_id for Mexico

  // Replace the parameters in the RSS URL template
  const rssUrlTemplate = `https://rss.app/new-rss-feed/rss-builder?cssGeneralTitle=div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20main%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20a%3Anth-child(1)&cssContainer=div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20main%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div&jsTimeout=auto&url=https%3A%2F%2Fwww.airbnb.com%2Fs%2FMexico%2Fhomes%3Ftab_id%3Dhome_tab%26refinement_paths%255B%255D%3D%252Fhomes%26adults%3D${adults}%26checkin%3D${checkin}%26checkout%3D${checkout}%26place_id%3D${placeId}`;

  return rssUrlTemplate;
}

// Route to get the RSS feed from the search URL
app.get('/get-rss', async (req, res) => {
  const { searchUrl } = req.query;  // Get the search URL from the request query

  try {
    const dynamicRssUrl = generateRssUrl(searchUrl);  // Generate the dynamic RSS URL based on user input

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

    // Navigate to the dynamically generated RSS URL
    await page.goto(dynamicRssUrl, { waitUntil: 'networkidle2' });
    console.log('Page timeout. Going back and retrying...');
    await page.reload({ waitUntil: 'networkidle2' }); 
    // Wait for the feed URL to be generated
    await page.evaluate(() => {
      // Find the button with the inner text 'Load Website'
      const buttons = [...document.querySelectorAll('h6')];  // Get all h6 elements
      const loadButton = buttons.find(button => button.textContent.trim() === 'Generate');
      if (loadButton) {
        loadButton.click();  // Click on the button
      } else {
        console.log('Generate button not found');
      }
    });
    await waitForTimeout(25000);
    // Extract the RSS feed URL from the page
    const rssUrl = await page.evaluate(() => {
      return document.querySelector('input[aria-invalid="false"][autocomplete="off"]').value;
    });

    await browser.close();

    // Send back the RSS feed URL
    res.json({ rssUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch the RSS feed' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
