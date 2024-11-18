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
  const urlParams = new URLSearchParams(searchUrl);
  const checkin = urlParams.get('checkin') || '2024-09-25';
  const checkout = urlParams.get('checkout') || '2024-09-26';
  const adults = urlParams.get('adults') || '2';
  const placeId = urlParams.get('place_id') || 'ChIJU1NoiDs6BIQREZgJa760ZO0';  // Default place_id for Mexico

  const rssUrlTemplate = `https://rss.app/new-rss-feed/rss-builder?cssGeneralTitle=div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20main%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20a%3Anth-child(1)&cssContainer=div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20main%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div&jsTimeout=auto&url=https%3A%2F%2Fwww.airbnb.com%2Fs%2FMexico%2Fhomes%3Ftab_id%3Dhome_tab%26refinement_paths%255B%255D%3D%252Fhomes%26adults%3D${adults}%26checkin%3D${checkin}%26checkout%3D${checkout}%26place_id%3D${placeId}`;

  return rssUrlTemplate;
}

// Route to get the RSS feed from the search URL
app.get('/get-rss', async (req, res) => {
  const { searchUrl } = req.query;  // Get the search URL from the request query

  const maxRetries = 5;  // Maximum number of retry attempts
  let attempts = 0;
  let success = false;
  let rssUrl = null;

  while (attempts < maxRetries && !success) {
    attempts++;
    console.log(`Attempt ${attempts} to fetch the RSS feed...`);

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
      await page.waitForSelector('input[placeholder="Email address"]');
      await page.type('input[placeholder="Email address"]', 'shangefagansf@outlook.com'); // Replace with your email
      await page.waitForSelector('input[placeholder="Password"]');
      await page.type('input[placeholder="Password"]', 'Bubbob20'); // Replace with your password

      // Click the submit button and wait for navigation
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      // Navigate to the dynamically generated RSS URL
      await page.goto(dynamicRssUrl, { waitUntil: 'networkidle2' });
      await waitForTimeout(5000);

      // Check if there is a session timeout error
      const sessionTimeout = await page.evaluate(() => {
        return [...document.querySelectorAll('p')].some(p => p.textContent.includes('Your session has expired.'));
      });

      if (sessionTimeout) {
        console.log('Session expired. Reloading and retrying...');
        await page.reload({ waitUntil: 'networkidle2' });
        await waitForTimeout(3000);
      }

      // Wait for the "Generate" button to appear and click it
      await page.waitForSelector('h6.MuiTypography-root');
      await page.evaluate(() => {
        const buttons = [...document.querySelectorAll('h6')];
        const generateButton = buttons.find(button => button.textContent.trim() === 'Generate');
        if (generateButton) {
          generateButton.click();  // Click the Generate button
        } else {
          console.log('Generate button not found');
        }
      });

      // Wait for the RSS generation process to start
      await waitForTimeout(5000);

      // Check for the error message saying no posts were detected
      const generationFailed = await page.evaluate(() => {
        return [...document.querySelectorAll('p')].some(p => p.textContent.includes(`RSS.app wasn't able to find any posts`));
      });

      if (generationFailed) {
        console.log('RSS feed generation failed (no posts detected). Retrying...');
        await page.reload({ waitUntil: 'networkidle2' });
        await waitForTimeout(3000);

        // Retry the process of clicking "Generate"
        await page.evaluate(() => {
          const buttons = [...document.querySelectorAll('h6')];
          const generateButton = buttons.find(button => button.textContent.trim() === 'Generate');
          if (generateButton) {
            generateButton.click();  // Click the Generate button
          }
        });

        await waitForTimeout(5000);
      }

      // Extract the RSS feed URL from the page
      rssUrl = await page.evaluate(() => {
        const rssInput = document.querySelector('input[aria-invalid="false"][autocomplete="off"]');
        return rssInput ? rssInput.value : null;
      });

      if (rssUrl) {
        success = true;  // Mark success and break loop
        console.log(`RSS feed successfully generated: ${rssUrl}`);
        res.json({ rssUrl });  // Send back the RSS feed URL
      } else {
        console.log('RSS feed URL not found, retrying...');
        throw new Error('RSS feed URL not found');
      }

      await browser.close();

    } catch (err) {
      console.error(`Attempt ${attempts} failed: ${err.message}`);
      await waitForTimeout(3000);  // Wait before retrying
    }
  }

  if (!success) {
    res.status(500).json({ error: 'Failed to fetch the RSS feed after multiple attempts' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
