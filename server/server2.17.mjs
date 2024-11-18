import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: 'http://bnb-navigator.com', // Allow only your domain
  credentials: true // If you need to send cookies or other credentials
}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://bnb-navigator.com");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


async function scrapeAirbnbPosts(searchUrl) {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080',  // Simulate a normal browser window size
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'  // Use a modern browser's user-agent
      ]
      });
    const page = await browser.newPage();

    // Navigate to the Airbnb search results page
    // Set a longer timeout for navigation
await page.goto(searchUrl, {
  waitUntil: 'networkidle2',  // Wait until no network requests for at least 500ms
  timeout: 120000              // Increase the timeout to 60 seconds
});
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (['stylesheet', 'font'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });
    // Scrape the post elements (titles, images, prices, etc.)
    // Scrape the post elements using data-testid
    const posts = await page.evaluate(() => {
      // Get both title and subtitle for each post
      const postElements = [...document.querySelectorAll('[data-testid="listing-card-title"]')].map((post, index) => {
        const subtitleElement = document.querySelectorAll('[data-testid="listing-card-subtitle"]')[index]; // Corresponding subtitle element
        const subtitleNameElement = document.querySelectorAll('[data-testid="listing-card-name"]')[index]; // Corresponding subtitle element
        const postElementSubTitle = document.querySelectorAll('[data-testid="listing-card-subtitle"][aria-hidden="true"]');
        const priceElement = document.querySelectorAll('[data-testid="price-availability-row"]')[index]; // Corresponding subtitle element
        const ratingElement = document.querySelectorAll('[data-testid="price-availability-row"][aria-hidden="true"]');
        // Target the picture tag and get the first source's srcset
        const imgElement = document.querySelectorAll('img[data-original-uri]')[index]; // Accessing the specific img element by index
        const imageUrl = imgElement ? imgElement.getAttribute('data-original-uri') : '';
        // Target the <a> tag with aria-hidden="true" for the listing link
    const linkElement = document.querySelectorAll('a[aria-hidden="true"]')[index];
    //const listingLink = linkElement ? linkElement.getAttribute('href') : null; // Extract href from the anchor tag

        return {
          image: imageUrl,  
          title: post.innerText,  // Scrape the title text
          subtitle: subtitleElement ? subtitleElement.innerText : null,  // Scrape the subtitle text (if exists)
          listing_name: subtitleNameElement ? subtitleNameElement.innerText : null,  // Scrape the subtitle text (if exists)
          listing_details: postElementSubTitle ? postElementSubTitle.innerText : null,  // Scrape the subtitle text (if exists)
          listing_price_details: priceElement ? priceElement.innerText : null,  // Scrape the subtitle text (if exists)
          rating_out_of_5_stars: ratingElement ? ratingElement.innerText : null,  // Scrape the subtitle text (if exists)
          link: linkElement ? linkElement.href : null, // Get the full link URL
        };        
      });
      return postElements;
    });

    await browser.close();
    return posts;
  } catch (err) {
    console.error('Error scraping Airbnb posts:', err);
    return [];
  }
}
app.get('/scrape-airbnb', async (req, res) => {
  const searchUrl = req.query.searchUrl;  // Get the dynamically generated URL from the frontend
  console.log(`Scraping Airbnb posts for URL: ${searchUrl}`);  // Log the URL for debugging
  
  const posts = await scrapeAirbnbPosts(searchUrl);  // Pass the dynamic URL to the scraping function
  res.json(posts);  // Send the scraped posts back as JSON response
  console.log('Scraping completed, posts fetched: ', posts.length);
  console.log('Scraped posts: ', posts);

});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
