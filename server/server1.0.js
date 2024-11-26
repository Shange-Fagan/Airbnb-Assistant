import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import path from 'path';

const app = express();

const PORT = process.env.PORT || 3000; // Use Heroku's port or default to 3000

// Serve static files from the public directory
//app.use(express.static(path.join(__dirname, 'public')));

// Handle the root route
//app.get('/', (req, res) => {
  //res.sendFile(path.join(__dirname, 'index.html'));
//});

// Proper CORS setup
// Use CORS to allow requests from your frontend domain
// Allow CORS from your GitHub Pages domain
app.use(cors({
  origin: ['https://shange-fagan.github.io', 'http://bnb-navigator.com', 'http://localhost:5001', 'https://airbnb-assistant-7e89835c55e1.herokuapp.com/'], // Add your frontend URLs here
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',
}));
app.options('*', cors()); // Enable preflight across all routes

function waitForTimeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


// Airbnb Scraping based on searchUrl (Original code)
async function scrapeAirbnbPosts(searchUrl) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
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
    const posts2 = await page.evaluate(() => {
      const postElements = [...document.querySelectorAll('[data-testid="listing-card-title"]')].map((post, index) => {
        const subtitleElement = document.querySelectorAll('[data-testid="listing-card-subtitle"]')[index];
        const subtitleNameElement = document.querySelectorAll('[data-testid="listing-card-name"]')[index];
        const priceElement = document.querySelectorAll('[data-testid="price-availability-row"]')[index];
        // Select only the first image from the listing carousel
        const imgElement = document.querySelectorAll('picture source[srcset]')[index];
        const imageUrl = imgElement ? imgElement.getAttribute('srcset').split(' ')[0] : '';
        const linkElement = document.querySelectorAll('a[aria-hidden="true"]')[index];

        return {
          images: imageUrl,
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
    return posts2;
  } catch (err) {
    console.error('Error scraping Airbnb posts:', err);
    return [];
  }
}
app.get('/scrape-airbnb', async (req, res) => {
  //const { location, category, checkin, checkout, guests } = req.query;
 // Default search URL for Airbnb
 // Construct the initial Airbnb URL (without map bounds)
  // Get today's date
const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
 // Get the first day of the current month
const monthlyStartDate = new Date(today.getFullYear(), today.getMonth(), 1);

// Get the end date three months from the current month
const monthlyEndDate = new Date(today.getFullYear(), today.getMonth() + 3, 0); // 0 gives the last day of the previous month
// Format the dates to YYYY-MM-DD
const monthlyStart = monthlyStartDate.toISOString().split('T')[0];  // First day of current month
const monthlyEnd = monthlyEndDate.toISOString().split('T')[0];  // Last day of the month 3 months from now

 
const { searchUrl, category } = req.query;
// Parse the searchUrl to extract the query parameters
const parsedUrl = new URL(searchUrl);
const location = parsedUrl.pathname.split('/')[2]; // Extract 'location' from the path
const checkin = parsedUrl.searchParams.get('checkin');
const checkout = parsedUrl.searchParams.get('checkout');
const guests = parsedUrl.searchParams.get('adults');
//const monthly_start = parsedUrl.searchParams.get('monthlyStart');
//const monthly_end = parsedUrl.searchParams.get('monthlyEnd');

console.log(`Location: ${location}, Checkin: ${checkin}, Checkout: ${checkout}, Guests: ${guests}`);

// Use these parameters to build your final search URL
let finalSearchUrl = `https://www.airbnb.com/s/${location}/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&adults=${guests}&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=${monthlyStart}&monthly_length=3&monthly_end_date=${monthlyEnd}&price_filter_input_type=0&channel=EXPLORE&date_picker_type=calendar&checkin=${checkin}&checkout=${checkout}&source=structured_search_input_header&search_type=unknown&price_filter_num_nights=1&drawer_open=true`;

console.log(`Generated URL: ${finalSearchUrl}`);
//let searchUrl = `https://www.airbnb.com/s/${location}/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&adults=2&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=${monthlyStart}&monthly_length=3&monthly_end_date=${monthlyEnd}&price_filter_input_type=0&channel=EXPLORE&date_picker_type=calendar&checkin=${checkin}&checkout=${checkout}&adults=${guests}&source=structured_search_input_header&search_type=unknown&price_filter_num_nights=1&drawer_open=true`;
  console.log(`Scraping Airbnb posts for URL: ${finalSearchUrl}`);  // Log the URL for debugging
  const posts2 = await scrapeAirbnbPosts(finalSearchUrl);  // Pass the dynamic URL to the scraping function
  console.log('Scraped posts: ', posts2);
  //res.json(posts);  // Send the scraped posts back as JSON response
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

console.log(`Generated URL: ${finalSearchUrl}`);
  // Extract the map bounds and zoom level from the initial Airbnb URL
  const { mapBounds, zoomLevel } = await extractBoundsFromUrl(finalSearchUrl);
  // Scrape the pixel coordinates of the markers
  const markers = await scrapeAirbnbMapMarkers(finalSearchUrl);

  if (!Array.isArray(markers)) {
    console.error("Markers is not an array:", markers);
    return res.status(500).json({ error: "Markers is not an array" });
  }

  if (!mapBounds || isNaN(zoomLevel)) {
    res.status(500).json({ error: 'Failed to fetch map bounds' });
    return;
  }
   // Construct the final Airbnb URL with map bounds and zoom level
   finalSearchUrl += `&ne_lat=${mapBounds.northeast.lat}&ne_lng=${mapBounds.northeast.lng}&sw_lat=${mapBounds.southwest.lat}&sw_lng=${mapBounds.southwest.lng}&zoom=${zoomLevel}&zoom_level=${zoomLevel}&search_by_map=true`;
   console.log('Navigating to final URL:', finalSearchUrl);
console.log('Map bounds:', mapBounds);
  console.log('Zoom Level:', zoomLevel);
  console.log('Marker positions:', markers);
    

  // Convert each pixel marker to lat/lng
  // Convert all marker pixel positions to lat/lng
  const mapWidth = 1024;
  const mapHeight = 768;
// Convert all marker pixel positions to lat/lng with scaling
const scaleFactor = 3; // Adjust this factor as needed
const markerLatLngs = markers.map(marker => pixelToLatLng(marker.left, marker.top, mapBounds, mapWidth, mapHeight, scaleFactor));

console.log('Converted Marker Lat/Lng with Scaling:', markerLatLngs);
console.log('Scraping completed, posts fetched: ', posts2.length);
  // Send the lat/lng markers as JSON response
  //res.json(markerLatLngs);
  
  
    if (!Array.isArray(posts2)) {
        throw new Error('Posts should be an array');
    }
  res.json({
    posts2,       // The Airbnb posts
    markers: markerLatLngs  // The converted marker coordinates
  })
});
// Airbnb Scraping based on region and category (New functionality)

// Function to scrape pixel positions of Airbnb markers

async function simulateMouseDrag(page, startX, startY, endX, endY) {
  // Move the mouse to the start position
  await page.mouse.move(startX, startY);

  // Simulate mouse down (click and hold)
  await page.mouse.down();

  // Simulate the drag to the end position
  await page.mouse.move(endX, endY, { steps: 10 }); // Adjust 'steps' for smoothness

  // Simulate mouse up (release the click)
  await page.mouse.up();
}
// Function to scrape location information from Airbnb and fetch bounds from Google Maps
async function extractBoundsFromUrl(searchUrl) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  
  await page.goto(searchUrl, { waitUntil: 'networkidle2' }); // Wait for the page to be fully loaded
  await page.evaluate(() => {
  // Select the popup container
const popup = document.querySelector('div.c8qah1m.atm_9s_11p5wf0.atm_h_1h6ojuz');

// Select the close button within the popup using its class
const closeButton = popup ? popup.querySelector('button.cd570ix.atm_d2_1bvjyxt.atm_gz_exct8b.atm_j_v2br90') : null;

// Click the close button
if (closeButton) {
    closeButton.click();
    console.log('Popup closed successfully.');
} else {
    console.log('Close button not found.');
}
  })
  await page.evaluate(() => {
    // Select the popup container
  const popup2 = document.querySelector('div.tw5hock atm_c8_2x1prs atm_g3_1jbyh58 atm_fr_11a07z3 atm_cs_wp830q dir dir-ltr');
  
  // Select the close button within the popup using its class
  const closeButton = popup2 ? popup2.querySelector('button.b1rrt7c2 atm_mk_h2mmj6 atm_vy_l52nlx atm_e2_l52nlx atm_gi_idpfg4 atm_l8_idpfg4 atm_3f_glywfm atm_5j_1ssbidh atm_26_1j28jx2 atm_9j_tlke0l atm_tl_1gw4zv3 atm_7l_3ha9i4 atm_kd_glywfm atm_92_1yyfdc7_vmtskl atm_9s_1ulexfb_vmtskl atm_mk_stnw88_vmtskl atm_tk_1ssbidh_vmtskl atm_fq_1ssbidh_vmtskl atm_tr_pryxvc_vmtskl atm_vy_1tcgj5g_vmtskl atm_e2_1tcgj5g_vmtskl atm_5j_1ssbidh_vmtskl atm_3f_glywfm_jo46a5 atm_l8_idpfg4_jo46a5 atm_gi_idpfg4_jo46a5 atm_3f_glywfm_1icshfk atm_kd_glywfm_19774hq atm_uc_aaiy6o_1w3cfyq atm_uc_glywfm_1w3cfyq_1rrf6b5 atm_70_13xi5zr_9xuho3 atm_uc_aaiy6o_pfnrn2_1oszvuo atm_uc_glywfm_pfnrn2_1o31aam atm_70_13xi5zr_1buez3b_1oszvuo dir dir-ltr') : null;
  
  // Click the close button
  if (closeButton) {
      closeButton.click();
      console.log('Popup closed successfully.');
  } else {
      console.log('Close button not found.');
  }
    })
  // Targeting the button by its visible text 'Show map'
  await page.waitForSelector('button', { visible: true });
  console.log("'Accept all' button clicked successfully.");
  const buttons = await page.$$eval('button', buttons => 
    buttons.map(button => button.innerText.trim())
  );
  const acceptCookiesButtonIndex = buttons.findIndex(button => button.includes('Accept all'))

  if (acceptCookiesButtonIndex !== -1) {
    // Click on the button that contains 'Show map' text
    const buttonsSelector = await page.$$('button');
    console.log('Clicking "Accept Cookies" button');
    await buttonsSelector[acceptCookiesButtonIndex].click();
    await waitForTimeout(5000); // Wait for the map to load after clicking
  }
  const showMapButtonIndex = buttons.findIndex(button => button.includes('Show map'));
  
  if (showMapButtonIndex !== -1) {
    // Click on the button that contains 'Show map' text
    const buttonsSelector = await page.$$('button');
    console.log('Clicking "Show map" button');
    await buttonsSelector[showMapButtonIndex].click();
    await waitForTimeout(5000); // Wait for the map to load after clicking
  } else {
    console.log('Could not find "Show map" button.');
  }
  await waitForTimeout(5000);
  // Simulate dragging the map (moving it slightly)
  // Wait for the map container to be visible
  await page.waitForSelector('div[data-testid="map/GoogleMap"]', { visible: true });

  // Simulate dragging the map (start and end coordinates)
  await simulateMouseDrag(page, 600, 400, 605, 415); // Adjust coordinates based on map size
  await simulateMouseDrag(page, 605, 415, 600, 415);
  await simulateMouseDrag(page, 600, 415, 610, 415);
  await simulateMouseDrag(page, 600, 415, 610, 430);
  // Wait for the map to update
  await waitForTimeout(5000);

  // Extract the updated URL
  const newUrl = page.url();
  console.log('New URL after dragging the map:', newUrl);
  // Targeting the button by its visible text 'Show map'

  // Step 2: Use Google Maps to search for the same location
// Function to scrape Google Maps for bounds based on a centered location

 // Function to get the map bounds from the Airbnb map (without Google Maps API)
 // Wait for the map container with data-testid="map/GoogleMap"
 //await page.waitForSelector('div[data-testid="map/GoogleMap"]');

// Execute script to access the map object and get bounds
// Create a URL object
// Function to scrape Airbnb for generated URL based on region
// Automatically click on the first marker
// Wait for the marker divs to load
  // Extract bounds and zoom from the generated URL
  const parsedUrl = new URL(newUrl);

  // Extract map bounds and zoom level
  const mapBounds = {
    northeast: {
      lat: parseFloat(parsedUrl.searchParams.get("ne_lat")),
      lng: parseFloat(parsedUrl.searchParams.get("ne_lng")),
    },
    southwest: {
      lat: parseFloat(parsedUrl.searchParams.get("sw_lat")),
      lng: parseFloat(parsedUrl.searchParams.get("sw_lng")),
    },
  };

  const zoomLevel = parseFloat(parsedUrl.searchParams.get("zoom"));

  console.log('Map Bounds:', mapBounds);
  console.log('Zoom Level:', zoomLevel);
  await browser.close();
  // Return the map bounds and zoom level
  return { mapBounds, zoomLevel };
}
// Function to scrape pixel positions of Airbnb markers
async function scrapeAirbnbMapMarkers(searchUrl) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to Airbnb map page
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
  // Select the popup container
const popup = document.querySelector('div.c8qah1m.atm_9s_11p5wf0.atm_h_1h6ojuz');

// Select the close button within the popup using its class
const closeButton = popup ? popup.querySelector('button.cd570ix.atm_d2_1bvjyxt.atm_gz_exct8b.atm_j_v2br90') : null;

// Click the close button
if (closeButton) {
    closeButton.click();
    console.log('Popup closed successfully.');
} else {
    console.log('Close button not found.');
}
  })
  await page.evaluate(() => {
    // Select the popup container
  const popup2 = document.querySelector('div.tw5hock atm_c8_2x1prs atm_g3_1jbyh58 atm_fr_11a07z3 atm_cs_wp830q dir dir-ltr');
  
  // Select the close button within the popup using its class
  const closeButton = popup2 ? popup2.querySelector('button.b1rrt7c2 atm_mk_h2mmj6 atm_vy_l52nlx atm_e2_l52nlx atm_gi_idpfg4 atm_l8_idpfg4 atm_3f_glywfm atm_5j_1ssbidh atm_26_1j28jx2 atm_9j_tlke0l atm_tl_1gw4zv3 atm_7l_3ha9i4 atm_kd_glywfm atm_92_1yyfdc7_vmtskl atm_9s_1ulexfb_vmtskl atm_mk_stnw88_vmtskl atm_tk_1ssbidh_vmtskl atm_fq_1ssbidh_vmtskl atm_tr_pryxvc_vmtskl atm_vy_1tcgj5g_vmtskl atm_e2_1tcgj5g_vmtskl atm_5j_1ssbidh_vmtskl atm_3f_glywfm_jo46a5 atm_l8_idpfg4_jo46a5 atm_gi_idpfg4_jo46a5 atm_3f_glywfm_1icshfk atm_kd_glywfm_19774hq atm_uc_aaiy6o_1w3cfyq atm_uc_glywfm_1w3cfyq_1rrf6b5 atm_70_13xi5zr_9xuho3 atm_uc_aaiy6o_pfnrn2_1oszvuo atm_uc_glywfm_pfnrn2_1o31aam atm_70_13xi5zr_1buez3b_1oszvuo dir dir-ltr') : null;
  
  // Click the close button
  if (closeButton) {
      closeButton.click();
      console.log('Popup closed successfully.');
  } else {
      console.log('Close button not found.');
  }
    })
  // Targeting the button by its visible text 'Show map'
  await page.waitForSelector('button', { visible: true });

  const buttons = await page.$$eval('button', buttons => 
    buttons.map(button => button.innerText.trim())
  );
  const acceptCookiesButtonIndex = buttons.findIndex(button => button.includes('Accept all'))

  /*if (acceptCookiesButtonIndex !== -1) {
    // Click on the button that contains 'Show map' text
    const buttonsSelector = await page.$$('button');
    console.log('Clicking "Accept Cookies" button');
    await buttonsSelector[acceptCookiesButtonIndex].click();
    await waitForTimeout(5000); // Wait for the map to load after clicking
  } else {
    console.log('Could not find "Accept Cookies" button.');
  }*/
  const showMapButtonIndex = buttons.findIndex(button => button.includes('Show map'));
  
  if (showMapButtonIndex !== -1) {
    // Click on the button that contains 'Show map' text
    const buttonsSelector = await page.$$('button');
    console.log('Clicking "Show map" button');
    await buttonsSelector[showMapButtonIndex].click();
    await waitForTimeout(5000); // Wait for the map to load after clicking
  } else {
    console.log('Could not find "Show map" button.');
  }
// Simulate dragging the map (start and end coordinates)
await simulateMouseDrag(page, 600, 400, 605, 415); // Adjust coordinates based on map size
await simulateMouseDrag(page, 605, 415, 600, 415);
await simulateMouseDrag(page, 600, 415, 610, 415);
await simulateMouseDrag(page, 600, 415, 610, 430);
// Wait for the map to update
await waitForTimeout(5000);

  // Wait for the marker divs to load
    try {
    await waitForTimeout(5000);
    console.log('Looking for markers...');
    await page.waitForSelector('div[style*="position: absolute"]', { timeout: 10000 });
    
    // Extract marker pixel positions from the map
    console.log('Looking for markers...');
    const markers = await page.evaluate(() => {
      const markerElements = document.querySelectorAll('div[style*="position: absolute"]');
      console.log('Found marker elements:', markerElements.length);
      const markersData = [];

      markerElements.forEach(marker => {
        const style = marker.getAttribute('style');
        const transformMatch = style.match(/transform:\s*translate\((-?\d+(\.\d+)?)px,\s*(-?\d+(\.\d+)?)px\)/);

        if (transformMatch) {
          const left = parseFloat(transformMatch[1]);
          const top = parseFloat(transformMatch[3]);
          // Filter out unwanted markers: (left 0, top 0), (left 1, top 1), (left 24, top 24), (left 50, top 50), and (left 64, top 24)
          // Filter out unwanted markers based on custom rules
          if ((left !== 0 && left !== 1 && left !== 24 && left !== 50 && left !== 64) || (top !== 0 && top !== 1 && top !== 24 && top !== 50)) {
            markersData.push({ left, top });
          }
        }
      });

      console.log('Scraped markers data:', markersData); // Log the scraped data
      return markersData;
    });
    console.log('Markers found:', markers);
    await browser.close();
    return markers;
  } catch (error) {
    console.log('Error finding markers:', error);
    await browser.close();
    return [];
  }
}
// Function to convert pixel positions to latitude and longitude
// Function to convert pixel positions to latitude and longitude with scaling
function pixelToLatLng(pixelX, pixelY, mapBounds, mapWidth = 1024, mapHeight = 768, scaleFactor = 3) {
  if (!mapBounds || !mapBounds.northeast || !mapBounds.southwest) {
    console.error('Invalid map bounds for pixel-to-lat/lng conversion');
    return null;
  }

  // Calculate the latitude and longitude range, scaled down by the scaleFactor
  const latRange = (mapBounds.northeast.lat - mapBounds.southwest.lat) / scaleFactor;
  const lngRange = (mapBounds.northeast.lng - mapBounds.southwest.lng) / scaleFactor;
  const latitudeAdjustment = 9.5; // Adjust this value as needed
  // Convert pixelX and pixelY to latitude and longitude
  const lat = mapBounds.southwest.lat + (pixelY / mapHeight) * latRange + latitudeAdjustment;
  //const lng = mapBounds.southwest.lng + (pixelX / mapWidth) * lngRange;
// Adjust longitude by a small value (e.g., 5 degrees to the right)
const longitudeAdjustment = 30.5; // Adjust this value as needed
const lng = mapBounds.southwest.lng + (pixelX / mapWidth) * lngRange + longitudeAdjustment;

  return { lat, lng };
}
// Express route to scrape Airbnb markers and convert them to lat/lng
app.get('/get-markers', async (req, res) => {
  const { region, category, guests } = req.query; // Get region and category from query params
  // Construct the initial Airbnb URL (without map bounds)
  // Get today's date
const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

// Get the first day of the current month
const monthlyStartDate = new Date(today.getFullYear(), today.getMonth(), 1);

// Get the end date three months from the current month
const monthlyEndDate = new Date(today.getFullYear(), today.getMonth() + 3, 0); // 0 gives the last day of the previous month

// Format the dates to YYYY-MM-DD
const checkin = today.toISOString().split('T')[0];  // Today's date in YYYY-MM-DD format
const checkout = tomorrow.toISOString().split('T')[0];  // Tomorrow's date in YYYY-MM-DD format
const monthlyStart = monthlyStartDate.toISOString().split('T')[0];  // First day of current month
const monthlyEnd = monthlyEndDate.toISOString().split('T')[0];  // Last day of the month 3 months from now

// Construct the URL with dynamic dates
let searchUrl = `https://www.airbnb.com/s/${region}/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&adults=2&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=${monthlyStart}&monthly_length=3&monthly_end_date=${monthlyEnd}&price_filter_input_type=0&channel=EXPLORE&date_picker_type=calendar&checkin=${checkin}&checkout=${checkout}&adults=${guests}&source=structured_search_input_header&search_type=unknown&price_filter_num_nights=1&drawer_open=true`;

console.log(`Generated URL: ${searchUrl}`);

  //let url2 = `https://www.airbnb.com/s/${region}/homes`;
  switch (category) {
  case 'popular':
      // No additional filter needed for 'popular', just return regular search results
      break;
  case 'cheapest':
    searchUrl += `?price_min=1`;  // Adjust this as necessary
    break;
  case 'mid-price':
    searchUrl += `?price_min=50&price_max=200`;  // Adjust price range as necessary
    break;
  case 'expensive':
    searchUrl += `?price_max=10000`;  // Adjust this as necessary
    break;
  // If the category is 'popular' or other categories, no additional filtering needed
  default:
    break;
}
  // Extract the map bounds and zoom level from the initial Airbnb URL
  const { mapBounds, zoomLevel } = await extractBoundsFromUrl(searchUrl);
  // Scrape the pixel coordinates of the markers
  const markers = await scrapeAirbnbMapMarkers(searchUrl);

  if (!mapBounds || isNaN(zoomLevel)) {
    res.status(500).json({ error: 'Failed to fetch map bounds' });
    return;
  }
   // Construct the final Airbnb URL with map bounds and zoom level
   searchUrl += `&ne_lat=${mapBounds.northeast.lat}&ne_lng=${mapBounds.northeast.lng}&sw_lat=${mapBounds.southwest.lat}&sw_lng=${mapBounds.southwest.lng}&zoom=${zoomLevel}&zoom_level=${zoomLevel}&search_by_map=true`;
   console.log('Navigating to final URL:', searchUrl);
console.log('Map bounds:', mapBounds);
  console.log('Zoom Level:', zoomLevel);
  console.log('Marker positions:', markers);
    

  // Convert each pixel marker to lat/lng
  // Convert all marker pixel positions to lat/lng
  const mapWidth = 1024;
  const mapHeight = 768;
// Convert all marker pixel positions to lat/lng with scaling
const scaleFactor = 3; // Adjust this factor as needed
const markerLatLngs = markers.map(marker => pixelToLatLng(marker.left, marker.top, mapBounds, mapWidth, mapHeight, scaleFactor));

console.log('Converted Marker Lat/Lng with Scaling:', markerLatLngs);


  // Send the lat/lng markers as JSON response
  res.json(markerLatLngs);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});