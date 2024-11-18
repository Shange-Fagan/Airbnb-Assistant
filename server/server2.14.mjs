//const express = require('express');
//const axios = require('axios');
import express from 'express';
import axios from 'axios';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
app.use(cors());  // Enable CORS to allow communication between the front-end and the back-end

// Utility function to wait for a specific timeout
function waitForTimeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// Function to generate the dynamic RSS URL based on user input
// Function to generate the dynamic RSS URL based on user input
function generateRssUrl(searchUrl) {
  const urlParams = new URLSearchParams(searchUrl);

  // Extract the query parameters from the searchUrl
  const checkin = urlParams.get('checkin') || '2024-09-25';
  const checkout = urlParams.get('checkout') || '2024-09-26';
  const guests = urlParams.get('guests') || '2';
  const priceMin = urlParams.get('price_min') || '0'; // Default minimum price if not provided
  const priceMax = urlParams.get('price_max') || '1000'; // Default maximum price if not provided

  // Extract the location from the path (since it's part of the path, not query params)
  const locationMatch = searchUrl.match(/\/s\/([^\/]+)\//);
  const location = locationMatch ? locationMatch[1] : 'europe';  // Default to Mexico if no match found

  // Generate the RSS URL using the extracted parameters
  const rssUrlTemplate = `https://rss.app/new-rss-feed/rss-builder?cssGeneralTitle=div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20main%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20div%20%3E%20a&jsTimeout=auto&url=https%3A%2F%2Fwww.airbnb.com%2Fs%2F${location}%2Fhomes%3Fcheckin%3D${checkin}%26checkout%3D${checkout}%26guests%3D${guests}%26price_min%3D${priceMin}%26price_max%3D${priceMax}&contentType=NEWS`;

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

      if (!generationFailed) {
        // Wait for the "Save Feed" button to appear and click it
        await page.waitForSelector('button[ga="create-feed-save-and-redirect"]', {timeout: 10000});
        await page.click('button[ga="create-feed-save-and-redirect"]');
      
        // Assume there might be a confirmation message or a page reload
        await waitForTimeout(5000);  // Arbitrary timeout for the UI to update
      
        // Check for confirmation of the feed being saved (this depends on the actual UI feedback which isn't specified)
        const isSaved = await page.evaluate(() => {
          const confirmationMessage = document.querySelector('div.success-message');  // Example: Adjust selector based on actual success confirmation
          return confirmationMessage && confirmationMessage.textContent.includes("Feed has been saved successfully");
        });
      
        if (isSaved) {
          console.log("Feed has been saved successfully.");
      
          // Now extract the actual RSS feed URL, typically available in the UI after saving
          rssUrl = await page.evaluate(() => {
            // This selector needs to be specific to where the RSS URL is displayed post-save
            const rssUrlElement = document.querySelector('h6');  // Adjust selector as needed
            rssUrlElement.find(button => button.textContent.trim() === 'Widgets');
            if (rssUrlElement) {
              rssUrlElement.click();  // Click the Generate button
            }
            // Wait for the button to be present
            page.waitForXPath("//button[contains(text(), 'Add to Website')]");

            // Click the button using XPath
            const [buttons2] = page.$x("//button[contains(text(), 'Add to Website')]");
            if (buttons2) {
              buttons2.click();
            } else {
            console.log('Button not found');
            }
            // Wait for the button to be present
            page.waitForXPath("//button[contains(text(), 'IFrame')]");

            // Click the button using XPath
            const [buttons3] = page.$x("//button[contains(text(), 'IFrame')]");
            if (buttons3) {
              buttons3.click();
            } else {
            console.log('Button not found');
            }
            const rssUrlElement2 = document.querySelector('textarea');  // Adjust selector as needed
            return rssUrlElement2 ? rssUrlElement2.value : null;
          });
      
          if (rssUrl) {
            console.log(`RSS feed URL extracted successfully: ${rssUrl}`);
            success = true;  // Mark success after successfully obtaining the RSS feed URL
          } else {
            throw new Error("Failed to extract RSS feed URL after saving.");
          }
        } else {
          console.log("Failed to confirm feed save. Retrying...");
          // Here you might decide to retry or handle the error differently
        }
      }
      
      if (success) {
        // Send back the RSS feed URL
        res.json({ rssUrl });
      } else {
        res.status(500).json({ error: 'Failed to fetch the RSS feed after multiple attempts' });
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
      
