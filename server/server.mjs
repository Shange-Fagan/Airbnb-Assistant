import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();

// Proper CORS setup
app.use(cors({
  origin: 'https://bnb-navigator.com',  // Allow requests from your frontend's domain
  methods: ['GET', 'POST'],
  credentials: true
}));

app.options('*', cors({
  origin: 'https://bnb-navigator.com',
  credentials: true
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");  // You can set a specific domain like 'http://bnb-navigator.com'
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});


// Airbnb Scraping based on searchUrl (Original code)
async function scrapeAirbnbPosts(searchUrl) {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ]
    });
    const page = await browser.newPage();

    // Navigate to the Airbnb search results page
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 120000
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
    const posts = await page.evaluate(() => {
      const postElements = [...document.querySelectorAll('[data-testid="listing-card-title"]')].map((post, index) => {
        const subtitleElement = document.querySelectorAll('[data-testid="listing-card-subtitle"]')[index];
        const subtitleNameElement = document.querySelectorAll('[data-testid="listing-card-name"]')[index];
        const priceElement = document.querySelectorAll('[data-testid="price-availability-row"]')[index];
        const imgElement = document.querySelectorAll('img[data-original-uri]')[index];
        const imageUrl = imgElement ? imgElement.getAttribute('data-original-uri') : '';
        const linkElement = document.querySelectorAll('a[aria-hidden="true"]')[index];

        return {
          image: imageUrl,
          title: post.innerText,
          subtitle: subtitleElement ? subtitleElement.innerText : null,
          listing_name: subtitleNameElement ? subtitleNameElement.innerText : null,
          listing_price_details: priceElement ? priceElement.innerText : null,
          link: linkElement ? linkElement.href : null
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
  const { location, category, checkin, checkout, guests } = req.query;
 // Default search URL for Airbnb
 let searchUrl = `https://www.airbnb.com/s/${location}/homes?checkin=${checkin}&checkout=${checkout}&adults=${guests}`;
  console.log(`Scraping Airbnb posts for URL: ${searchUrl}`);  // Log the URL for debugging
  // Add filters based on category
  switch (category) {
    case 'popular':
      // No additional filter needed for 'popular', just return regular search results
      break;
    case 'cheapest':
      searchUrl += `&price_min=1`; // This is a placeholder for cheapest filter
      break;
      case 'mid-price':
      searchUrl += `&price_min=50&price_max=200`; // Mid-price range (adjust as needed)
      break;
    case 'expensive':
      searchUrl += `&price_max=10000`; // Placeholder for expensive filter (you might need to modify this)
      break;
    // Add other categories as necessary
    default:
      break;
  }
  const posts = await scrapeAirbnbPosts(searchUrl);  // Pass the dynamic URL to the scraping function
  res.json(posts);  // Send the scraped posts back as JSON response
  console.log('Scraping completed, posts fetched: ', posts.length);
  console.log('Scraped posts: ', posts);

});
// Airbnb Scraping based on region and category (New functionality)

// Function to scrape pixel positions of Airbnb markers
// Function to scrape pixel positions of Airbnb markers
async function scrapeAirbnbMapMarkers(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to Airbnb map page
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Extract marker pixel positions from the map
  const markers = await page.evaluate(() => {
    const markerElements = document.querySelectorAll('div[tabindex="0"] > div[style*="position: absolute"]');
    const markersData = [];

    markerElements.forEach(marker => {
      const style = marker.getAttribute('style');
      const left = parseFloat(style.match(/left:\s*(-?\d+(\.\d+)?)/)[1]);
      const top = parseFloat(style.match(/top:\s*(-?\d+(\.\d+)?)/)[1]);

      markersData.push({ left, top });
    });
    console.log('Scraped markers data:', markersData);
    return markersData;
  });

  await browser.close();
  return markers;
}

// Function to convert pixel positions to latitude and longitude
function pixelToLatLng(pixelX, pixelY, mapBounds) {
  const lat = mapBounds.southwest.lat + (pixelY / mapBounds.height) * (mapBounds.northeast.lat - mapBounds.southwest.lat);
  const lng = mapBounds.southwest.lng + (pixelX / mapBounds.width) * (mapBounds.northeast.lng - mapBounds.southwest.lng);
  return { lat, lng };
}

// Function to scrape location information from Airbnb and fetch bounds from Google Maps
async function scrapeAndSearchGoogleMaps(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Step 1: Scrape the centered location from the Airbnb map
  await page.goto(url, { waitUntil: 'networkidle2' });
  const centeredLocation = await page.evaluate(() => {
    const ariaLiveElement = document.querySelector('span[aria-live="polite"]');
    return ariaLiveElement ? ariaLiveElement.innerText.match(/Centered on (.*)/)[1] : null;
  });

  if (!centeredLocation) {
    console.log('Could not find the centered location.');
    await browser.close();
    return null;
  }

  console.log(`Centered location found: ${centeredLocation}`);

  // Step 2: Use Google Maps to search for the same location
  const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(centeredLocation)}`;
  await page.goto(googleMapsUrl, { waitUntil: 'networkidle2' });

  // Wait for the map to load and get the bounds
  // Step 2: Try to access the existing Google Map object on the Airbnb page
const mapBounds = await page.evaluate(() => {
  // Try to access an existing Google Maps instance if available
  let mapElement = document.querySelector('div[role="main"]'); // or the correct div that holds the map
  let mapInstance = mapElement ? google.maps.Map.prototype : null; // Try to access the prototype if it exists
  
  if (!mapInstance) {
    console.error('Google Maps instance not found.');
    return null;
  }

  const bounds = mapInstance.getBounds(); // Fetch bounds from the Google Maps object
  if (!bounds) {
    console.error('Map bounds not found.');
    return null;
  }
  
  const northeast = bounds.getNorthEast();
  const southwest = bounds.getSouthWest();

  return {
    northeast: { lat: northeast.lat(), lng: northeast.lng() },
    southwest: { lat: southwest.lat(), lng: southwest.lng() }
  };
});

if (!mapBounds) {
  console.error('Failed to fetch map bounds from Google Maps API');
} else {
  console.log('Map bounds:', mapBounds);
}


  await browser.close();
  return mapBounds;
}

// Express route to scrape Airbnb markers and convert them to lat/lng
app.get('/get-markers', async (req, res) => {
  const { region, category } = req.query; // Get region and category from query params
  const url = `https://www.airbnb.com/s/${region}/homes`; // Generate Airbnb URL for the region
// Modify URL based on category
switch (category) {
  case 'popular':
      // No additional filter needed for 'popular', just return regular search results
      break;
  case 'cheapest':
    url += `?price_min=1`;  // Adjust this as necessary
    break;
  case 'mid-price':
    url += `?price_min=50&price_max=200`;  // Adjust price range as necessary
    break;
  case 'expensive':
    url += `?price_max=10000`;  // Adjust this as necessary
    break;
  // If the category is 'popular' or other categories, no additional filtering needed
  default:
    break;
}
  // Scrape the pixel coordinates of the markers
  const markers = await scrapeAirbnbMapMarkers(url);
// Fetch the map bounds dynamically
const mapBounds = await scrapeAndSearchGoogleMaps(url);  // Fetch bounds

if (!mapBounds) {
  res.status(500).json({ error: 'Failed to fetch map bounds' });
  return;
}
console.log('Map bounds:', mapBounds);
  console.log('Marker positions:', markers);
    

  // Convert each pixel marker to lat/lng
  const markerLatLngs = markers.map(marker => {
    return pixelToLatLng(marker.left, marker.top, mapBounds);
  });

  // Send the lat/lng markers as JSON response
  res.json(markerLatLngs);
});

// Express route to scrape location and get bounds from Google Maps
app.get('/get-map-bounds', async (req, res) => {
  const airbnbUrl = req.query.url;
  const bounds = await scrapeAndSearchGoogleMaps(airbnbUrl);

  if (bounds) {
    res.json(bounds);
  } else {
    res.status(500).json({ error: 'Failed to fetch map bounds' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});