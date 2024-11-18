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
  
        // Click the placeholder input "Enter or Click on Element" and input the selector
        await page.waitForSelector('input[placeholder="Enter or Click on Element"]');
        await page.click('input[placeholder="Enter or Click on Element"]');  // Click the input box
        await page.keyboard.type('div > div > div > div > div > div > div > main > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > a');  // Type the selector
  
        // Check if there is a session timeout error
        const sessionTimeout = await page.evaluate(() => {
          return [...document.querySelectorAll('p')].some(p => p.textContent.includes('Your session has expired.'));
        });
  
        if (sessionTimeout) {
          console.log('Session expired. Reloading and retrying...');
          await page.reload({ waitUntil: 'networkidle2' });
          await waitForTimeout(3000);
        }
  
        // Failsafe to ensure top-left element is clicked to highlight it
        //await page.mouse.click(25, 200);  // Click on the element to highlight items
  
        // Ensure the "Generate" button is not greyed out
        const isGenerateDisabled = await page.evaluate(() => {
          const generateButton = [...document.querySelectorAll('h6')].find(button => button.textContent.trim() === 'Generate');
          return generateButton && generateButton.closest('button').disabled;
        });
  
        if (isGenerateDisabled) {
          throw new Error('Generate button is disabled. Highlighting again...');
        }
  
        // Click the "Generate" button
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
        await waitForTimeout(30000);
  
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
  
          await waitForTimeout(30000);
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
              const rssUrlElement = document.querySelector('input[type="text"][readonly]');  // Adjust selector as needed
              return rssUrlElement ? rssUrlElement.value : null;
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