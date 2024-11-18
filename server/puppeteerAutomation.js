const puppeteer = require('puppeteer');
const { Octokit } = require("@octokit/rest");

const GITHUB_TOKEN = 'your_github_token';
const GITHUB_OWNER = 'your-github-username';
const GITHUB_REPO = 'your-repo-name';
const GITHUB_FILE_PATH = 'path/to/your/file.js';  // The file path in your repo

// Initialize GitHub API
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

(async () => {
  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Step 1: Login to Airbnb
  console.log("Logging into Airbnb...");
  await page.goto('https://www.airbnb.com/login');

  // Wait for login form and fill in credentials
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'your_airbnb_email@example.com');
  await page.type('input[type="password"]', 'your_airbnb_password');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // Step 2: Perform Airbnb search
  console.log("Performing Airbnb search...");
  await page.goto('https://www.airbnb.com/');
  await page.type('input[name="search_query"]', 'Vacation Europe 2 adults no kids');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // Capture the search URL
  const searchURL = page.url();
  console.log("Airbnb search URL:", searchURL);

  // Step 3: Login to RSS Feed Generator
  console.log("Logging into RSS feed generator...");
  await page.goto('https://rss-generator-login-page-url.com');
  await page.type('input[type="email"]', 'shangefagansf@outlook.com');
  await page.type('input[type="password"]', 'Bubbob20');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // Step 4: Generate iframe for main search results
  console.log("Generating first iframe for main display...");
  await page.goto('https://rss-generator-url.com/new-feed');
  await page.type('input[name="rss_url_input"]', searchURL);
  await page.select('select[name="theme_selector"]', 'main_theme'); // Select the theme for the main side
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  const mainIframeURL = await page.evaluate(() => {
    return document.querySelector('input[name="iframe_url"]').value;
  });
  console.log("Main iframe URL:", mainIframeURL);

  // Step 5: Generate iframe for markers on the globe
  console.log("Generating second iframe for clickable markers...");
  await page.goto('https://rss-generator-url.com/new-feed');
  await page.type('input[name="rss_url_input"]', searchURL);
  await page.select('select[name="theme_selector"]', 'marker_theme'); // Select the theme for clickable markers
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  const markerIframeURL = await page.evaluate(() => {
    return document.querySelector('input[name="iframe_url"]').value;
  });
  console.log("Marker iframe URL:", markerIframeURL);

  // Step 6: Update the iframe URLs in your GitHub repo
  console.log("Updating iframe URLs in GitHub...");
  const { data: fileData } = await octokit.repos.getContent({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path: GITHUB_FILE_PATH,
  });

  const fileContent = Buffer.from(fileData.content, 'base64').toString();

  // Replace placeholders for main iframe and marker iframe in the code
  const updatedContent = fileContent
    .replace(/(mainIframePlaceholder = ").*?(")/, `$1${mainIframeURL}$2`) // Update main iframe
    .replace(/(markerIframePlaceholder = ").*?(")/, `$1${markerIframeURL}$2`); // Update marker iframe

  await octokit.repos.createOrUpdateFileContents({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path: GITHUB_FILE_PATH,
    message: 'Update iframes for main page and markers',
    content: Buffer.from(updatedContent).toString('base64'),
    sha: fileData.sha,
  });

  console.log("Iframe URLs updated in GitHub successfully!");

  // Close the browser
  await browser.close();
})();
