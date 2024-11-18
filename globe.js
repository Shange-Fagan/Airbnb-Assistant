<!-- Scripts -->
  <!-- Include Three.js and other dependencies here -->
<!-- Include Three.js -->
	<!-- Add three.js and three-globe CDN links -->
  <script src="https://cdn.jsdelivr.net/npm/three@0.126.1/build/three.min.js"></script>
  <script src="https://unpkg.com/three-globe"></script>
  <!-- Main JavaScript -->
  <script type="module">
    // JavaScript code will go here
    import * as THREE from "https://unpkg.com/three@0.136.0/build/three.module.js";
  import { OrbitControls } from "https://unpkg.com/three@0.136.0/examples/jsm/controls/OrbitControls";
  import {
    CSS2DRenderer,
    CSS2DObject,
  } from "https://unpkg.com/three@0.136.0/examples/jsm/renderers/CSS2DRenderer.js";
    import { RGBELoader } from 'https://unpkg.com/three@0.136.0/examples/jsm/loaders/RGBELoader.js';
	  // Import necessary post-processing modules
import { EffectComposer } from 'https://unpkg.com/three@0.136.0/examples/jsm/postprocessing/EffectComposer.js?v=1';
import { RenderPass } from 'https://unpkg.com/three@0.136.0/examples/jsm/postprocessing/RenderPass.js?v=1';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.136.0/examples/jsm/postprocessing/UnrealBloomPass.js?v=1';

  
  // Scene Setup
  const scene = new THREE.Scene();
  /*const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 2000);*/
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set(20, 0.5, 15).setLength(25);
	  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  //renderer.setSize(innerWidth, innerHeight);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
  
  // Label Renderer
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(innerWidth, innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild(labelRenderer.domElement);
  
  // Controls
  const controls = new OrbitControls(camera, labelRenderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;
  controls.minDistance = 15;
  controls.maxDistance = 25;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;


   // Lighting - Reduced intensity to reduce glare
    /*const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4); // Reduced intensity
    directionalLight.position.set(5, 5, 5); // Adjust position
    scene.add(directionalLight);*/
  
  // Global Uniforms
  const globalUniforms = {
    time: { value: 0 },
  };
  
  // Handle Window Resize
  window.addEventListener('resize', onWindowResize);
  
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}
	  //let dayTexture, nightTexture;
    let isDay = true; // Track whether it's currently day or night
	  let rt;

	  let texture;

/*document.getElementById('newsButton').addEventListener('click', function() {
  if (isDay) {
    const newsOverlaynighttheme = document.getElementById('newsOverlaynighttheme');  
    const newsOverlay = document.getElementById('newsOverlay');

    newsOverlaynighttheme.style.display = 'flex';  // Show the night theme news overlay
    newsOverlay.style.display = 'none';  // Hide the day theme news overlay

    const closeNewsButton = document.getElementById('closeNewsButton');
    closeNewsButton.style.display = 'flex';  // Show the close button

  } else {
    const newsOverlay = document.getElementById('newsOverlay');
    const newsOverlaynighttheme = document.getElementById('newsOverlaynighttheme');

    newsOverlay.style.display = 'flex';  // Show the day theme news overlay
    newsOverlaynighttheme.style.display = 'none';  // Hide the night theme news overlay

    const closeNewsButton = document.getElementById('closeNewsButton');
    closeNewsButton.style.display = 'flex';  // Show the close button
  }

  // Toggle day/night mode
  isDay = !isDay;
}); // This closes the addEventListener function correctly
*/
	  document.getElementById('newsButton').addEventListener('click', function() {
  const newsOverlayDay = document.getElementById('newsOverlay');
  const newsOverlayNight = document.getElementById('newsOverlaynighttheme');
  const closeNewsButton = document.getElementById('closeNewsButton');
		  if (isDay) {
    // Show day theme news overlay
    newsOverlayDay.style.display = 'flex';
    newsOverlayNight.style.display = 'none';
  } else {
    // Show night theme news overlay
    newsOverlayNight.style.display = 'flex';
    newsOverlayDay.style.display = 'none';
  }

  // Display the close button in both cases
  closeNewsButton.style.display = 'flex';

	  });
		  
	/*// Example hover effect that changes the marker on the globe
        const listings = document.querySelectorAll('.listing');  // Assuming .listing is a class for each Airbnb
        listings.forEach((listing, index) => {
            listing.addEventListener('mouseover', () => {
                // Send message to globe iframe to change marker color
                document.getElementById('globeIframe').contentWindow.postMessage({ type: 'highlightMarker', index }, '*');
            });

            listing.addEventListener('mouseout', () => {
                // Remove highlight from marker
                document.getElementById('globeIframe').contentWindow.postMessage({ type: 'unhighlightMarker', index }, '*');
            });
        });

        // You can dynamically change the iframes based on the search results from Puppeteer
        function updateIframes(globeIframeUrl, listingsIframeUrl) {
            document.getElementById('globeIframe').src = globeIframeUrl;
            document.getElementById('listingsIframe').src = listingsIframeUrl;
        }
	  // Inside the globe iframe (globe.js or within the iframe)
window.addEventListener('message', (event) => {
  if (event.data.type === 'highlightMarker') {
    const markerIndex = event.data.index;
    highlightMarker(markerIndex);  // Function to highlight a marker
  } else if (event.data.type === 'unhighlightMarker') {
    const markerIndex = event.data.index;
    unhighlightMarker(markerIndex);  // Function to unhighlight a marker
  }
});
*/

  const selectedRegion = document.getElementById('regionSelect').value;

		  /*document.addEventListener("DOMContentLoaded", function() {
			  
  // Your existing event listeners and code go here
			  
  document.getElementById('submitRegion').addEventListener('click', function() {
  // Close the initial region popup
  document.getElementById('regionPopup').style.display = 'none';

  // Show the confirmation message
  document.getElementById('confirmationMessage').style.display = 'block';

  // Hide the confirmation message after 5 seconds
  setTimeout(function() {
    document.getElementById('confirmationMessage').style.display = 'none';
  }, 10000);
// Pan to the selected region
  panToRegion(selectedRegion);
});
});*/
	  document.addEventListener("DOMContentLoaded", function() {

  // Add event listener to the submit button
  document.getElementById('submitRegion').addEventListener('click', function() {
    // Close the initial region popup
    document.getElementById('regionPopup').style.display = 'none';

    // Show the confirmation message
    document.getElementById('confirmationMessage').style.display = 'block';

    // Hide the confirmation message after 10 seconds
    setTimeout(function() {
      document.getElementById('confirmationMessage').style.display = 'none';
    }, 20000);

    // Capture the selected region from the dropdown
    const selectedRegion = document.getElementById('regionSelect').value;

    // Pan to the selected region
    panToRegion(selectedRegion);
  });
});

   // Always visible region select button
  document.getElementById('regionSelectBtn').style.display = 'block';

  document.getElementById('regionSelectBtn').addEventListener('click', function() {
    // Check if dropdown already exists to avoid adding multiple
    if (!document.getElementById('regionSelectDropdown')) {
      // Create the dropdown menu with regions
      let regionSelect = document.createElement('select');
      regionSelect.id = 'regionSelectDropdown';
      regionSelect.innerHTML = `
        <option value="africa">Africa</option>
        <option value="europe">Europe</option>
        <option value="america">America</option>
        <option value="south america">South America</option>
        <option value="carribbean">Carribbean</option>
        <option value="asia">Asia</option>
	<option value="world">World</option>
      `;
      
      this.insertAdjacentElement('afterend', regionSelect);

// Ensure it's visible and styled correctly
    regionSelect.style.display = 'block';

      // Pan the camera to the selected region when changed
      regionSelect.addEventListener('change', function() {
        let selectedRegion = this.value;
        panToRegion(selectedRegion); // Call pan function with selected region
      });
    }
  });

// Function to stop all existing tweens
function stopAllTweens() {
    TWEEN.getAll().forEach(function(tween) {
        tween.stop(); // Stop each tween
    });
}
  // Function to pan the camera to the selected region
  // Function to pan the camera to the selected region
	function panToRegion(region) {
    let position;
    let zoomLevel;

    // Reset zoom to default value before transitioning
    camera.zoom = 1;
    camera.updateProjectionMatrix(); // Apply the reset zoom value

    switch (region) {
        case 'africa':
            position = { x: 12.0, y: 0, z: 1.74 }; // Increased the x-value to move further right
            zoomLevel = 1.5; // Adjust zoom level as needed
            break;
        case 'europe':
            // Moved slightly to the right (increase in x) and zoomed in more
            position = { x: 3.5, y: 2.91, z: 0.55 }; // Shifted right
            zoomLevel = 2.0; // Slightly more zoomed in
            break;
        case 'america':
            position = { x: 0, y: 2.55, z: 4.42 };
            zoomLevel = 2.0;
            break;
        case 'south america':
            position = { x: 1.5, y: -0.5, z: 4.3 }; // Increased x value to move further right
            zoomLevel = 1.7;
            break;
        case 'carribbean':
            position = { x: 0.65, y: 2.0, z: 4.6 }; // Adjusted for Caribbean
            zoomLevel = 2.4;
            break;
        case 'asia':
            position = { x: -0.89, y: 3.28, z: -3.92 };
            zoomLevel = 1.9;
            break;
        case 'world':
            position = { x: 0, y: 0, z: 10 }; // Zoomed-out, general view of the world
            zoomLevel = 0.5; // Reduced zoom level to show the entire Earth
            break;
        default:
            console.log('Region not recognized');
            return;
    }

    // Stop auto-rotation after panning
    controls.autoRotate = false;

    // Animate camera panning and zooming
    animateCameraPan(position.x, position.y, position.z, zoomLevel);
}

function animateCameraPan(x, y, z, zoomLevel) {
    new TWEEN.Tween(camera.position)
        .to({ x: x, y: y, z: z }, 2000) // Smoothly pan over 2 seconds
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () {
            camera.lookAt(0, 0, 0);
        })
        .start();

    // Add zooming to the pan
    new TWEEN.Tween(camera)
        .to({ zoom: zoomLevel }, 2000) // Adjust zoom over the same duration
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () {
            camera.updateProjectionMatrix(); // Important to update the camera matrix for zoom to take effect
        })
        .onComplete(function () {
            // After zoom and panning complete, restart slow auto-rotation
            setTimeout(function () {
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.25; // Slow rotation speed
            }, 500);
        })
        .start();
}

const textureLoader = new THREE.TextureLoader();
	
	  /*const cloudTexture2 = textureLoader.load("js/Earth_Cloud.jpg");
	  const cloudGeometry = new THREE.SphereGeometry(earthRadius * 1.005, 64, 64);
const cloudMaterial2 = new THREE.MeshPhongMaterial({
  map: cloudTexture2, // Use a high-quality cloud texture with transparency
  transparent: true,
  opacity: 0.4 // Adjust for subtle effect
});
const cloudMesh2 = new THREE.Mesh(cloudGeometry, cloudMaterial2);
scene.add(cloudMesh2);*/
	
let globe;

function initGlobeVisualization() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.set(0, 0, 100);  // Set a good camera position

  // Initialize globe with textures
  globe = new ThreeGlobe()
    .globeImageUrl('js/Earth_Diffuse.jpg')  // Use the URL of the texture
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png');  // Example bump map URL

  scene.add(globe);

  // Start with the globe centered view
  panGlobeToRegion({ lat: 0, lon: 0 });

  // Load city markers
  loadCityMarkers(globe);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  // Handle window resizing
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function loadCityMarkers(globe) {
  fetch('js/cities_xyz.geojson')
    .then(response => response.json())
    .then(data => {
      const markers = data.features.map(city => ({
        lat: city.geometry.coordinates[1],
        lon: city.geometry.coordinates[0],
        cityName: city.properties.name
      }));
      globe.pointsData(markers);  // Add markers to the globe
    });
}

function panGlobeToRegion(regionCoordinates) {
  if (globe) {
    const lat = regionCoordinates.lat;
    const lon = regionCoordinates.lon;

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    // Convert lat/lon to x, y, z spherical coordinates
    const radius = 500;
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    camera.position.set(x, y, z);
    camera.lookAt(globe.position);  // Make sure the camera is focused on the globe
  } else {
    console.error('Globe is not initialized.');
  }
}

function performSearch(searchUrl, regionCoordinates) {
  document.getElementById('airbnbIframe').src = searchUrl;
  document.getElementById('container').classList.add('split-screen');
  panGlobeToRegion(regionCoordinates);
}

// Add an event listener for the search button
document.getElementById('searchBtn').addEventListener('click', function () {
  const where = document.getElementById('location').value;
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const guests = document.getElementById('guests').value;
  const priceMin = document.getElementById('priceMin').value;
  const priceMax = document.getElementById('priceMax').value;

  if (!where || !checkin || !checkout || !guests) {
    alert('Please fill out all required fields.');
    return;
  }

  const searchUrl = `https://www.airbnb.com/s/${where}/homes?checkin=${checkin}&checkout=${checkout}&guests=${guests}&price_min=${priceMin}&price_max=${priceMax}`;
  const regionCoordinates = { lat: 50, lon: 10 };  // Example coordinates
  performSearch(searchUrl, regionCoordinates);
});

// Initialize globe when the page loads
window.onload = initGlobeVisualization;

  /*document.getElementById('searchBtn').addEventListener('click', function() {
    const where = document.getElementById('where').value;  // Get destination
    const checkin = document.getElementById('date').value;  // Get check-in date
    const checkout = document.getElementById('checkout').value;  // Get check-out date
    const guests = document.getElementById('guests').value;  // Get number of guests
    const priceMin = document.getElementById('price_min').value;  // Get min price
    const priceMax = document.getElementById('price_max').value;  // Get max price

    // Ensure that required fields are filled
    if (!where || !checkin || !guests) {
      alert('Please fill in all required fields before searching.');
      return;
    }

    // Generate Airbnb search URL
    let airbnbUrl = `https://www.airbnb.com/s/${where}/homes?checkin=${checkin}&guests=${guests}`;

    // Add checkout date if provided
    if (checkout) {
      airbnbUrl += `&checkout=${checkout}`;
    }

    // Add minimum price if provided
    if (priceMin) {
      airbnbUrl += `&price_min=${priceMin}`;
    }

    // Add maximum price if provided
    if (priceMax) {
      airbnbUrl += `&price_max=${priceMax}`;
    }

    // Redirect to the generated Airbnb URL
    //window.location.href = airbnbUrl;

	  // Load the Airbnb search results into the iframe
  document.getElementById('resultsIframe').src = airbnbUrl;

	  // Collapse the region into detailed markers on the globe
  displayRegionMarkers(where);
  });*/

/*document.getElementById('searchBtn').addEventListener('click', () => {
  const where = document.getElementById('where').value;
  const when = document.getElementById('when').value;
  const guests = document.getElementById('guests').value;

  // Show results iframe
  const iframeSrc = generateAirbnbUrl(where, when, guests);
  document.getElementById('resultsIframe').src = iframeSrc;

  // Adjust layout
  document.getElementById('content').style.display = 'flex';
});*/

/*function generateAirbnbUrl(where, when, guests) {
  return `https://www.airbnb.com/s/${where}/homes?checkin=${when}&guests=${guests}`;
}
  function loadMarkersForRegion(region) {
  const markersData = getMarkersDataForRegion(region);
  markersData.forEach(marker => {
    addMarkerToGlobe(marker);
  });
}*/

	 /* document.getElementById('newsButton').addEventListener('click', function() {
  const newsOverlay = document.getElementById('newsOverlay');
  newsOverlay.style.display = 'flex';  // Show the news iframe
const closeNewsButton = document.getElementById('closeNewsButton');
  closeNewsButton.style.display = 'flex';  // Show the news iframe
});*/

document.getElementById('closeNewsButton').addEventListener('click', function() {
  document.getElementById('newsOverlay').style.display = 'none';  // Close the news iframe
document.getElementById('newsOverlaynighttheme').style.display = 'none';
document.getElementById('closeNewsButton').style.display = 'none';  // Close the news iframe
});
	  // Function to close the news overlay when clicking outside the iframe
function closeNewsOverlayOnClick(event) {
  const newsOverlay = document.getElementById('newsOverlay');
  const newsIframe = document.getElementById('newsIframe');

  // Check if the click was outside the news overlay iframe
  if (newsOverlay.style.display === 'block' && !newsIframe.contains(event.target)) {
    newsOverlay.style.display = 'none'; // Hide the overlay
  }
}

// Function to close the night theme overlay
function closeNewsOverlayNightOnClick(event) {
  const newsOverlayNight = document.getElementById('newsOverlaynighttheme');
  const newsIframeNight = document.getElementById('newsIframenighttheme');

  // Check if the click was outside the night theme overlay iframe
  if (newsOverlayNight.style.display === 'block' && !newsIframeNight.contains(event.target)) {
    newsOverlayNight.style.display = 'none'; // Hide the night theme overlay
  }
}

// Add event listeners to close overlays when clicking outside
document.addEventListener('click', closeNewsOverlayOnClick);
document.addEventListener('click', closeNewsOverlayNightOnClick);


	  
const cloudTexture = new THREE.TextureLoader().load('https://mrdoob.com/lab/javascript/webgl/clouds/cloud10.png')
  const cloudMaterial = new THREE.ShaderMaterial({
  uniforms: {
    cloudTexture: { type: 't', value: cloudTexture }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D cloudTexture;
    varying vec2 vUv;
    void main() {
      vec4 textureColor = texture2D(cloudTexture, vUv);
      textureColor.a *= 0.9;  // Adjust opacity
      gl_FragColor = vec4(textureColor.rgb, textureColor.a);
    }
  `,
  transparent: true
});

// Create geometry and apply the shader material
const cloudGeo = new THREE.PlaneGeometry(800, 800);
const cloudMesh = new THREE.Mesh(cloudGeo, cloudMaterial);

// Position the clouds in the scene
//cloudMesh.position.set(-100, -100, -500);// Add clouds after texture is loaded
//cloudMesh.position.set(-200, -100, -700);// Add clouds after texture is loaded
  cloudMesh.position.set(-700, -100, -1000);// Add clouds after texture is loaded
  //scene.add(cloudMesh);
	 // const daymarkerMaterial = '#ff3232';
 // const nightmarkerMaterial = '#FE8C02';
	  //const daymarkerMaterial = new THREE.Color('#ff3232');
//const nightmarkerMaterial = new THREE.Color('#FE8C02');
	  const daymarkerMaterial = new THREE.Color('#ff3232');
const nightmarkerMaterial = new THREE.Color('#FE8C02');
	  //const daymarkerMaterial = new THREE.Color('#00FF00');
//const nightmarkerMaterial = new THREE.Color('#FFFFFF');

const markerMaterial = new THREE.MeshBasicMaterial({
    color: daymarkerMaterial,
    onBeforeCompile: (shader) => {
      shader.uniforms.time = globalUniforms.time;
      shader.vertexShader = `
      	attribute float phase;
        varying float vPhase;
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
        	vPhase = phase; // de-synch of ripples
        `
      );
      shader.fragmentShader = `
      	uniform float time;
        varying float vPhase;
      	${shader.fragmentShader}
      `.replace(
        `vec4 diffuseColor = vec4( diffuse, opacity );`,
        `
        vec2 lUv = (vUv - 0.5) * 2.;
        float val = 0.;
        float lenUv = length(lUv);
        val = max(val, 1. - step(0.25, lenUv)); // central circle
        val = max(val, step(0.4, lenUv) - step(0.5, lenUv)); // outer circle

        float tShift = fract(time * 0.5 + vPhase);
        val = max(val, step(0.4 + (tShift * 0.6), lenUv) - step(0.5 + (tShift * 0.5), lenUv)); // ripple

        if (val < 0.5) discard;

        vec4 diffuseColor = vec4( diffuse, opacity );`
      );
    },
  });
  markerMaterial.defines = { USE_UV: '' };
	  

    // Track loaded textures
let texturesLoaded = 0;
const totalTextures = 4; // Update this if you have more or fewer textures

function checkTexturesLoaded() {
  texturesLoaded++;
  if (texturesLoaded === totalTextures) {
    animate(); // Start animation after all textures are loaded
  }
}
	   // Check if the user is on a mobile device
    if (window.innerWidth <= 768) {  // This checks for mobile devices based on screen width
        camera.position.set(20, 0.5, 15).setLength(20);     // Set the camera's z position to 25 for mobile device
    } else {
        camera.position.set(20, 0.5, 15).setLength(16);    // Default z position for desktop or larger screens
    }
	  
    //let dayTexture, nightTexture;
    //let isDay = true; // Track whether it's currently day or night

// Load Textures
//const textureLoader = new THREE.TextureLoader();

// Background Texture
   /* const loader = new THREE.TextureLoader();
loader.load('textures/TCom_Aerials0006_3_L.jpg', function (texture) {
  const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
  rt.fromEquirectangularTexture(renderer, texture);
  //scene.background = rt.texture;
});*/

	  // Load the Cube Map
      const cubeTextureLoader = new THREE.CubeTextureLoader();
	  const isMobile = /Mobi/i.test(navigator.userAgent);

/*const cubeMap = cubeTextureLoader.load([
  isMobile ? 'js/px.webp' : 'js/px.png', // Right face
  isMobile ? 'js/nx.webp' : 'js/nx.png', // Left face
  isMobile ? 'js/py.webp' : 'js/py.png', // Top face
  isMobile ? 'js/ny.webp' : 'js/ny.png', // Bottom face
  isMobile ? 'js/pz.webp' : 'js/pz.png', // Front face
  isMobile ? 'js/nz.webp' : 'js/nz.png'  // Back face
]);*/
	  // Load Cube Maps for Background
    //const cubeTextureLoader = new THREE.CubeTextureLoader();
   /* const dayCubeMap = cubeTextureLoader.load([
     isMobile ? 'js/px.webp' : 'js/px.png', // Right face
  isMobile ? 'js/nx.webp' : 'js/nx.png', // Left face
  isMobile ? 'js/py.webp' : 'js/py.png', // Top face
  isMobile ? 'js/ny.webp' : 'js/ny.png', // Bottom face
  isMobile ? 'js/pz.webp' : 'js/pz.png', // Front face
  isMobile ? 'js/nz.webp' : 'js/nz.png'  // Back face
    ]);
	  const dayCubeMap2 = cubeTextureLoader.load([
     isMobile ? 'textures/px___(1).webp' : 'textures/px___(1).png', // Right face
  isMobile ? 'textures/py___(1).webp' : 'textures/py___(1).png', // Left face
  isMobile ? 'textures/py___(1).webp' : 'textures/py___(1).png', // Top face
  isMobile ? 'textures/ny___(1).webp' : 'textures/ny___(1).png', // Bottom face
  isMobile ? 'textures/pz___(1).webp' : 'textures/pz___(1).png', // Front face
  isMobile ? 'textures/nz___(1).webp' : 'textures/nz___(1).png'  // Back face
    ]);
    const nightCubeMap = cubeTextureLoader.load([
      isMobile ? 'js/px_(1).webp' : 'textures/px_(1).png', // Right face
  isMobile ? 'js/nx_(1).webp' : 'textures/nx_(1).png', // Left face
  isMobile ? 'js/py_(1).webp' : 'textures/py_(1).png', // Top face
  isMobile ? 'js/ny_(1).webp' : 'textures/ny_(1).png', // Bottom face
  isMobile ? 'js/pz_(1).webp' : 'textures/pz_(1).png', // Front face
  isMobile ? 'js/nz_(1).webp' : 'textures/nz_(1).png'  // Back face
    ]);*/

    // Set Initial Background Cube Map
   // scene.background = dayCubeMap;
   // scene.background = new THREE.Color(0x87CEEB); // Light sky blue
	 // Create a gradient for the daytime scene background
const canvas = document.createElement('canvas');
canvas.width = 1024;
canvas.height = 1024;

const context = canvas.getContext('2d');

// Create gradient from light sky blue to deep space blue
const gradient = context.createRadialGradient(512, 512, 100, 512, 512, 512);
gradient.addColorStop(0, '#87CEEB');  // Light sky blue near Earth
gradient.addColorStop(1, '#4682B4');  // Deep space blue at edges
context.fillStyle = gradient;
context.fillRect(0, 0, canvas.width, canvas.height);

// Create a texture from the canvas
const daybackgroundTexture = new THREE.CanvasTexture(canvas);

// Create a gradient for the night scene background
const canvas2 = document.createElement('canvas');
canvas2.width = 1024;
canvas2.height = 1024;

const context2 = canvas2.getContext('2d');  // Use the correct 'canvas2'

// Create gradient from dark blue to slightly lighter blue
const gradient2 = context2.createRadialGradient(512, 512, 100, 512, 512, 512);
gradient2.addColorStop(0, '#000033');  // Darker blue (center near Earth)
gradient2.addColorStop(1, '#000066');  // Slightly lighter blue for edges (space)
context2.fillStyle = gradient2;
context2.fillRect(0, 0, canvas2.width, canvas2.height);

// Create a texture from the canvas
const nightbackgroundTexture = new THREE.CanvasTexture(canvas2);
	  // Load Textures
  //const textureLoader = new THREE.TextureLoader();
  //const dayTexture = textureLoader.load("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg");
	 //const dayTexture = textureLoader.load("js/Earth_Diffuse.jpg");
    //const dayTexture = textureLoader.load("textures/earth-blue-marble-with-clouds.jpeg");
//const dayTexture = textureLoader.load("textures/8k_earth_daymap.jpg");
  const nightTexture = textureLoader.load("//unpkg.com/three-globe/example/img/earth-night.jpg");
	  //const nightTexture = textureLoader.load("js/Earth_Night.jpg");
	  //const nightTexture = textureLoader.load("textures/8k_earth_nightmap.jpg");
  const bumpMap = textureLoader.load("//unpkg.com/three-globe/example/img/earth-topology.png");
  //const specularMap = textureLoader.load("//unpkg.com/three-globe/example/img/earth-water.png");
	  const specularMap = textureLoader.load("js/Earth_Specular.jpg");
const dayBumpMap = textureLoader.load("//unpkg.com/three-globe/example/img/earth-topology.png");
	  const normalMap = textureLoader.load('js/Earth_Normal.jpg'); // Use a realistic normal map
const nightBumpMap = textureLoader.load("//unpkg.com/three-globe/example/img/earth-topology.png");

/*// Ensure correct wrapping
dayTexture.wrapS = THREE.ClampToEdgeWrapping;
dayTexture.wrapT = THREE.ClampToEdgeWrapping;

// Use appropriate filtering
dayTexture.minFilter = THREE.LinearFilter;
dayTexture.magFilter = THREE.LinearFilter;*/


	  // Ensure correct wrapping
nightTexture.wrapS = THREE.ClampToEdgeWrapping;
nightTexture.wrapT = THREE.ClampToEdgeWrapping;

// Use appropriate filtering
nightTexture.minFilter = THREE.LinearFilter;
nightTexture.magFilter = THREE.LinearFilter;

  
	  const shaderMaterial2 = new THREE.ShaderMaterial({
  uniforms: {
    /*dayTexture: { type: 't', value: dayTexture },*/
    nightTexture: { type: 't', value: nightTexture },
    transition: { value: 0 } // 0 for day, 1 for night
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform float transition; // Smooth transition factor
    varying vec2 vUv;
    void main() {
      vec4 day = texture2D(dayTexture, vUv);
      vec4 night = texture2D(nightTexture, vUv);
      gl_FragColor = mix(day, night, transition);
    }
  `,
});

	// Set the background of the scene
        scene.add(cloudMesh);
	scene.background = daybackgroundTexture;
// Toggle between Day/Night Textures and Cube Map
    function toggleDayNight() {
      if (isDay) {
	        // Check if the user is on a mobile device
    if (window.innerWidth <= 768) {  // This checks for mobile devices based on screen width
        document.getElementById("nightTicker").style.display = "none";
	    document.getElementById("dayTicker").style.display = "none";
	    document.getElementById("mobileTicker").style.display = "block";
	    // Set the transition to night
        new TWEEN.Tween(shaderMaterial2.uniforms.transition)
        .to({ value: 1 }, 20000)  // Smooth transition over 2 seconds
        .start();
        //globe2.material.map = nightTexture;
        //scene.background = nightCubeMap;
        // Set a dark blue color for the night theme background
        //scene.background = new THREE.Color(0x000033); // Dark blue
	scene.background = nightbackgroundTexture;
	//scene.add(starField); // Add stars for the night
        scene.remove(cloudMesh); // Remove clouds for night
        markerMaterial.color.set(nightmarkerMaterial);
        document.getElementById("toggleButton").textContent = "Switch to Day";
    } else {
        // Set the transition to night
        new TWEEN.Tween(shaderMaterial2.uniforms.transition)
        .to({ value: 1 }, 20000)  // Smooth transition over 2 seconds
        .start();
        //lobe2.material.map = nightTexture;
        //scene.background = nightCubeMap;
        // Set a dark blue color for the night theme background
        //scene.background = new THREE.Color(0x000033); // Dark blue
	scene.background = nightbackgroundTexture;
	//scene.add(starField); // Add stars for the night
        scene.remove(cloudMesh); // Remove clouds for night
        markerMaterial.color.set(nightmarkerMaterial);
        document.getElementById("toggleButton").textContent = "Switch to Day";
        document.getElementById("dayTicker").style.display = "none";
        document.getElementById("nightTicker").style.display = "block";
	    	document.getElementById("mobileTicker").style.display = "none";

    }
        
      } else {
	      // Check if the user is on a mobile device
    if (window.innerWidth <= 768) {  // This checks for mobile devices based on screen width
        document.getElementById("nightTicker").style.display = "none";
	    document.getElementById("dayTicker").style.display = "none";
	    document.getElementById("mobileTicker").style.display = "block";
	    // Set the transition to day
        new TWEEN.Tween(shaderMaterial2.uniforms.transition)
        .to({ value: 0 }, 20000)  // Smooth transition over 2 seconds
        .start();
        //globe2.material.map = dayTexture;
        //scene.background = dayCubeMap;
        // Set a solid blue color for the background
        //scene.background = new THREE.Color(0x87CEEB); // Light sky blue
	scene.background = daybackgroundTexture;
	//scene.remove(starField); // Remove stars in the day
        scene.add(cloudMesh); // Add clouds back for day
        markerMaterial.color.set(daymarkerMaterial);
        document.getElementById("toggleButton").textContent = "Switch to Night";
    } else {
	// Set the transition to day
        new TWEEN.Tween(shaderMaterial2.uniforms.transition)
        .to({ value: 0 }, 20000)  // Smooth transition over 2 seconds
        .start();
        //globe2.material.map = dayTexture;
        //scene.background = dayCubeMap;
        // Set a solid blue color for the background
        //scene.background = new THREE.Color(0x87CEEB); // Light sky blue
	scene.background = daybackgroundTexture;
	//scene.remove(starField); // Remove stars in the day
        scene.add(cloudMesh); // Add clouds back for day
        markerMaterial.color.set(daymarkerMaterial);
        document.getElementById("toggleButton").textContent = "Switch to Night";
        document.getElementById("dayTicker").style.display = "block";
        document.getElementById("nightTicker").style.display = "none";
	document.getElementById("mobileTicker").style.display = "none";
		}
      }
      //globe2.material.needsUpdate = true;
      isDay = !isDay;
    }

	// Add Event Listener to the Toggle Button
	    document.getElementById('toggleButton').addEventListener('click', toggleDayNight);

		/*// Load Textures
  //const textureLoader = new THREE.TextureLoader();
  const dayTexture = textureLoader.load("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg");
  const nightTexture = textureLoader.load("//unpkg.com/three-globe/example/img/earth-night.jpg");
  const bumpMap = textureLoader.load("//unpkg.com/three-globe/example/img/earth-topology.png");
  const specularMap = textureLoader.load("//unpkg.com/three-globe/example/img/earth-water.png");
const dayBumpMap = textureLoader.load("//unpkg.com/three-globe/example/img/earth-topology.png");
const nightBumpMap = textureLoader.load("//unpkg.com/three-globe/example/img/earth-topology.png");
  */
  // Globe Material
	const sphereWidth = 5.1;
  const sphereHeight = 128.1;
  const sphereDepth = 128.1;
  const geometry21 = new THREE.SphereGeometry(
    sphereWidth,
    sphereHeight,
    sphereDepth
  );

  const sphereWidth2 = 5.099;
  const sphereHeight2 = 128.1;
  const sphereDepth2 = 128.1;
  const geometry2 = new THREE.SphereGeometry(
    sphereWidth2,
    sphereHeight2,
    sphereDepth2
  );
  //const textureLoader = new THREE.TextureLoader();
  const shaderMaterial = new THREE.ShaderMaterial({});

  const material = new THREE.ShaderMaterial({
    vertexShader: `
                varying vec2 vertexUV;
                varying vec3 vertexNormal;
                   void main() {
                        vertexUV = uv;
                        vertexNormal = normalize(normalMatrix * normal);
                       gl_Position = projectionMatrix
                       * modelViewMatrix
                       * vec4(position, 1);
                     }
                    `,
    fragmentShader: `
                    uniform sampler2D globeTexture;
                    uniform sampler2D bumpMap;
                    uniform sampler2D bumpScale;
                    uniform sampler2D specularMap;
                    uniform sampler2D specular;
                    uniform sampler2D shininess;
                    varying vec2 vertexUV;
                    varying vec3 vertexNormal;
                     void main() {
                     float intensity = 1.05 - dot(
                     vertexNormal, vec3(0, 0, 1.0));
                     vec3 atmosphere = (vec3(0.3, 0.6, 1.0))
                     * pow(intensity, 1.5);
                        gl_FragColor = vec4(atmosphere +texture2D(globeTexture, vertexUV).xyz, 1.0),
                         vec4(atmosphere +texture2D(bumpMap, vertexUV).xyz, 2.0);
                     }
                    `,

    uniforms: {
      /*"color": { value: new THREE.Color( 0xffffff ) },
  			"diffuse": { value: new THREE.Color( 0xffffff ) },*/
      specular: { value: new THREE.Color("grey") },
      /*"emissive": { value: new THREE.Color( 0x000000 ) },
  			"opacity": { value: 1 },*/
      shininess: { value: 15 },
      bumpMap: {
        value: new THREE.TextureLoader().load(
          "//unpkg.com/three-globe/example/img/earth-topology.png"
        ),
      },

      bumpScale: {
        value: 0,
      },

      specularMap: {
        value: new THREE.TextureLoader().load(
          "//unpkg.com/three-globe/example/img/earth-water.png"
        ),
      },
      globeTexture: {
        value: "",
      },
      /*bump: {
                          value: new THREE.TextureLoader().load("//unpkg.com/three-globe/example/img/earth-topology.png")
                          }*/
    },
  });

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(5.1, 128.1, 128.1),
    new THREE.ShaderMaterial({
      vertexShader: `
                varying vec3 vertexNormal;
                   void main() {
                        vertexNormal = normalize(normalMatrix * normal);
                       gl_Position = projectionMatrix
                       * modelViewMatrix
                       * vec4(position, 1);
                     }
                    `,
      fragmentShader: `
                varying vec3 vertexNormal;
                    void main() {
                    float intensity = pow(0.6 - dot(
                     vertexNormal, vec3(0, 0, 1.0)), 2.0);
                     gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
                    }
                    `,
	    //transparent: true, 
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    })
  );
	  
	atmosphere.scale.set(1, 1, 1);	
	  
  /*const material2 = new THREE.MeshPhongMaterial({
  //specular: 0x111111,
  //shininess: 5,
  shininess: 15,
  //map: dayTexture, // Start with day texture
  specularMap: specularMap,
  bumpMap: dayBumpMap, // Start with day bump map
  bumpScale: 0.05,
normalMap: normalMap,
  blending: THREE.AdditiveBlending,
  /*specular: 0x222222,*/
 /*specular: new THREE.Color('grey'), // Color of reflection, subtle for realism
});*/
	  //let globe = new THREE.Mesh(geometry2, material);
  //let globe2 = new THREE.Mesh(geometry, material2);
  /*scene.add(atmosphere);*/
  //scene.add(globe);
  //scene.add(globe2);*/

  // custom globe material
  /*const globeMaterial = globe.material;
  material.bumpScale = 10;
  new THREE.TextureLoader().load(
    "//unpkg.com/three-globe/example/img/earth-water.png",
    (texture) => {
      globeMaterial.specularMap = texture;
      globeMaterial.specular = new THREE.Color("grey");
      globeMaterial.shininess = 15;
    }
  );*/
  /*setTimeout(() => {
    // wait for scene to be populated (asynchronously)
    var dl = new THREE.DirectionalLight(0xffffff, 1);
    dl.position.set(1, 1, 1);
    //scene.add(dl); // change light position to see the specularMap's effect
  });
  // White directional light at half intensity shining from the top.
  const directionalLight = new THREE.DirectionalLight(0x909090, 1);
  directionalLight.position.set(-1, -1, -1);
  scene.add(directionalLight);
  var dl2 = new THREE.DirectionalLight(0xffffff, 1);
  dl2.position.set(0, 1, 1);
  //scene.add(dl2); // change light position to see the specularMap's effect
  var dl3 = new THREE.DirectionalLight(0xffffff, 1);
  dl3.position.set(3, 2, 1);
  //scene.add(dl3);
  const light2 = new THREE.AmbientLight(0x808080); // soft white light
  scene.add(light2);

  var light = new THREE.DirectionalLight(0xf0f0f0, 1);
  light.position.set(5, 3, 5);
  scene.add(light);
	  
directionalLight.intensity = 0.3;  // Reduce the brightness of the light
	  dl2.intensity = 0.3;
	  dl3.intensity = 0.3;*/
	  
// Create directional light and reduce its intensity
	  setTimeout(() => {
var dl = new THREE.DirectionalLight(0xffffff, 0.3); // Reduced intensity
dl.position.set(1, 1, 1);
//scene.add(dl); // Add the light to the scene
	  });
// White directional light at half intensity shining from the top, with reduced intensity
const directionalLight = new THREE.DirectionalLight(0x909090, 0.5); // Reduced intensity
directionalLight.position.set(-1, -1, -1);
scene.add(directionalLight);

var dl2 = new THREE.DirectionalLight(0xffffff, 0.5); // Reduced intensity
dl2.position.set(0, 1, 1);
//scene.add(dl2);

var dl3 = new THREE.DirectionalLight(0xffffff, 0.5); // Reduced intensity
dl3.position.set(3, 2, 1);
//scene.add(dl3);

// Ambient light for soft lighting, unchanged
const light2 = new THREE.AmbientLight(0x808080); // soft white light
scene.add(light2);

var light = new THREE.DirectionalLight(0xf0f0f0, 0.5); // Reduced intensity
light.position.set(5, 3, 5);
scene.add(light);

// Update intensity for directional lights dynamically if needed
directionalLight.intensity = 0.5;
dl2.intensity = 0.5;
dl3.intensity = 0.5;



    // Markers Data
  const markersData = [
    {
      //Africa
      id: 1,
      position: [5.1, 1.2, 1.5],
      iframeSrc: "https://rss.app/embed/v1/list/hKdSIKMe0o5AmG18",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"false"
    },
    // ... Add other markers here
    {
      //Europe
      id: 2,
      position: [5.1, 0.7, 1.8],
      iframeSrc: "https://rss.app/embed/v1/list/sum7m4TJWVJk8HMN",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //America
      id: 3,
      position: [5.1, 0.9, 0],
      iframeSrc: "https://rss.app/embed/v1/list/chAYVOo3llbQzNLo",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //South America
      id: 4,
      position: [5.1, 1.6, 0.4],
      iframeSrc: "https://rss.app/embed/v1/list/DP9kzxo2dohbbgST",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //Middle East
      id: 5,
      position: [5.1, 1, 2.3],
      iframeSrc: "https://rss.app/embed/v1/list/JCYAnBzooyfhbDvO",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //Asia
      id: 6,
      position: [5.1, 0.9, 3],
      iframeSrc: "https://rss.app/embed/v1/list/pUeauCbzsXuVe3eC",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //Japan
      id: 7,
      position: [5.1, 0.9, 4],
      iframeSrc: "https://rss.app/embed/v1/list/d6hKxeycgIlya2NK",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      // Jamaica
      id: 8,
      position: [5.1, 1.2, 0.2],
      iframeSrc: "https://rss.app/embed/v1/list/qvlJz8EBa0yKiH2i",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //UK
      id: 9,
      position: [5.1, 0.6, 1.45],
      iframeSrc: "https://rss.app/embed/v1/list/VQIhB1FM0tC17q5Y",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
  ];
  const markersDataforCheapestAirbnbs = [
    {
      //Africa
      id: 1,
      position: [5.1, 1.2, 1.5],
      iframeSrc: "https://rss.app/embed/v1/list/hKdSIKMe0o5AmG18",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"false"
    },
    // ... Add other markers here
    {
      //Europe
      id: 2,
      position: [5.1, 0.7, 1.8],
      iframeSrc: "https://rss.app/embed/v1/list/sum7m4TJWVJk8HMN",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //America
      id: 3,
      position: [5.1, 0.9, 0],
      iframeSrc: "https://rss.app/embed/v1/list/chAYVOo3llbQzNLo",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //South America
      id: 4,
      position: [5.1, 1.6, 0.4],
      iframeSrc: "https://rss.app/embed/v1/list/DP9kzxo2dohbbgST",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //Middle East
      id: 5,
      position: [5.1, 1, 2.3],
      iframeSrc: "https://rss.app/embed/v1/list/JCYAnBzooyfhbDvO",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //Asia
      id: 6,
      position: [5.1, 0.9, 3],
      iframeSrc: "https://rss.app/embed/v1/list/pUeauCbzsXuVe3eC",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //Japan
      id: 7,
      position: [5.1, 0.9, 4],
      iframeSrc: "https://rss.app/embed/v1/list/d6hKxeycgIlya2NK",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      // Jamaica
      id: 8,
      position: [5.1, 1.2, 0.2],
      iframeSrc: "https://rss.app/embed/v1/list/qvlJz8EBa0yKiH2i",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //UK
      id: 9,
      position: [5.1, 0.6, 1.45],
      iframeSrc: "https://rss.app/embed/v1/list/VQIhB1FM0tC17q5Y",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
  ];
	  const markersDataforMidPriceAirbnbs = [
    {
      //Africa
      id: 1,
      position: [5.1, 1.2, 1.5],
      iframeSrc: "https://rss.app/embed/v1/list/hKdSIKMe0o5AmG18",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"false"
    },
    // ... Add other markers here
    {
      //Europe
      id: 2,
      position: [5.1, 0.7, 1.8],
      iframeSrc: "https://rss.app/embed/v1/list/sum7m4TJWVJk8HMN",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //America
      id: 3,
      position: [5.1, 0.9, 0],
      iframeSrc: "https://rss.app/embed/v1/list/chAYVOo3llbQzNLo",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //South America
      id: 4,
      position: [5.1, 1.6, 0.4],
      iframeSrc: "https://rss.app/embed/v1/list/DP9kzxo2dohbbgST",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //Middle East
      id: 5,
      position: [5.1, 1, 2.3],
      iframeSrc: "https://rss.app/embed/v1/list/JCYAnBzooyfhbDvO",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //Asia
      id: 6,
      position: [5.1, 0.9, 3],
      iframeSrc: "https://rss.app/embed/v1/list/pUeauCbzsXuVe3eC",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //Japan
      id: 7,
      position: [5.1, 0.9, 4],
      iframeSrc: "https://rss.app/embed/v1/list/d6hKxeycgIlya2NK",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      // Jamaica
      id: 8,
      position: [5.1, 1.2, 0.2],
      iframeSrc: "https://rss.app/embed/v1/list/qvlJz8EBa0yKiH2i",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //UK
      id: 9,
      position: [5.1, 0.6, 1.45],
      iframeSrc: "https://rss.app/embed/v1/list/VQIhB1FM0tC17q5Y",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
  ];
	  const markersDataforExpensiveAirbnbs = [
    {
      //Africa
      id: 1,
      position: [5.1, 1.2, 1.5],
      iframeSrc: "https://rss.app/embed/v1/list/hKdSIKMe0o5AmG18",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"false"
    },
    // ... Add other markers here
    {
      //Europe
      id: 2,
      position: [5.1, 0.7, 1.8],
      iframeSrc: "https://rss.app/embed/v1/list/sum7m4TJWVJk8HMN",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //America
      id: 3,
      position: [5.1, 0.9, 0],
      iframeSrc: "https://rss.app/embed/v1/list/chAYVOo3llbQzNLo",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //South America
      id: 4,
      position: [5.1, 1.6, 0.4],
      iframeSrc: "https://rss.app/embed/v1/list/DP9kzxo2dohbbgST",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //Middle East
      id: 5,
      position: [5.1, 1, 2.3],
      iframeSrc: "https://rss.app/embed/v1/list/JCYAnBzooyfhbDvO",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //Asia
      id: 6,
      position: [5.1, 0.9, 3],
      iframeSrc: "https://rss.app/embed/v1/list/pUeauCbzsXuVe3eC",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //Japan
      id: 7,
      position: [5.1, 0.9, 4],
      iframeSrc: "https://rss.app/embed/v1/list/d6hKxeycgIlya2NK",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      // Jamaica
      id: 8,
      position: [5.1, 1.2, 0.2],
      iframeSrc: "https://rss.app/embed/v1/list/qvlJz8EBa0yKiH2i",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
    {
      //UK
      id: 9,
      position: [5.1, 0.6, 1.45],
      iframeSrc: "https://rss.app/embed/v1/list/VQIhB1FM0tC17q5Y",
      sandbox:"allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox",
      frameborder:"0",
      loading:"eager",
      width:"275",
      height:"300",
      scrolling:"yes",
      allowfullscreen:"true"
    },
  ];
  // Marker Geometry and Material
  const markerGeometry = new THREE.PlaneGeometry();
  // const markerGeometry = new THREE.PlaneGeometry(5, 5); // Increase size for mobile
if (window.innerWidth <= 768) {
  markerGeometry.scale(1.25, 1.25, 1.25); // Scale markers for mobile
}


  
  // Creating Markers
  const markerCount = markersData.length;
  const markers = new THREE.InstancedMesh(markerGeometry, markerMaterial, markerCount);
  
  const dummy = new THREE.Object3D();
  const phaseArray = [];
  
  markersData.forEach((data, index) => {
    const [radius, phi, theta] = data.position;
    dummy.position.setFromSphericalCoords(radius, phi, theta);
    dummy.lookAt(dummy.position.clone().setLength(radius + 1));
    dummy.updateMatrix();
    markers.setMatrixAt(index, dummy.matrix);
    phaseArray.push(Math.random());
    data.worldPosition = dummy.position.clone();
  });
  
  markerGeometry.setAttribute('phase', new THREE.InstancedBufferAttribute(new Float32Array(phaseArray), 1));
  scene.add(markers);
    // Labels Container
  const labelsContainer = document.getElementById('labels-container');
  
  // Create Labels
markersData.forEach((data) => {
  // Create Label Div
  const labelDiv = document.createElement('div');
  labelDiv.className = 'marker-label';
  labelDiv.id = `label-${data.id}`;

  // Close Button
  const closeButton = document.createElement('button');
  closeButton.className = 'close-button';
  closeButton.innerText = '×';
  labelDiv.appendChild(closeButton);

  // Close Button Event Listener
  closeButton.addEventListener('click', (event) => {
    console.log('Close button clicked'); // Check if this appears in the console
    event.stopPropagation(); // Stop the event from propagating up the DOM
    labelDiv.classList.remove('active');
    
    // Resume globe autorotation when the label is closed
    controls.autoRotate = true;
    
    // Re-enable the OrbitControls
    controls.enabled = true;
  });

  // Content Div
  const contentDiv = document.createElement('div');
  contentDiv.className = 'content';
  labelDiv.appendChild(contentDiv);

  // Append to Labels Container
  labelsContainer.appendChild(labelDiv);

  // CSS2DObject
  const labelObject = new CSS2DObject(labelDiv);
  labelObject.position.copy(data.worldPosition);
  scene.add(labelObject);

  // Store label object for interaction
  data.labelObject = labelObject;
  labelDiv.addEventListener('mousedown', (event) => {
    event.stopPropagation();
  });
  labelDiv.addEventListener('touchstart', (event) => {
    event.stopPropagation();
  });
});

// Raycaster for Interaction
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
	  
/*let activeLabel = null; // Keep track of the currently open iframe
	  
window.addEventListener('pointerdown', (event) => {
  pointer.x = (event.clientX / innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObject(markers).filter((m) => {
    return m.uv.subScalar(0.5).length() * 2 < 0.25;
  });

  if (intersects.length > 0) {
    const instanceId = intersects[0].instanceId;
    const data = markersData[instanceId];
	  
	  // Update Label Content
    const labelDiv = document.getElementById(`label-${data.id}`);
    const contentDiv = labelDiv.querySelector('.content');
	  
	  // Check if the iframe is related to the marker (specific iframe)
    if (!contentDiv.querySelector('iframe')) {
	  // Add loading spinner inside the content div
    contentDiv.innerHTML = `
    <div class="loading-spinner" style="pointer-events:none;"></div>
    <iframe src="${data.iframeSrc}" frameborder="0" width="275" height="249" scrolling="no" allowfullscreen="true" sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox" loading="eager"></iframe>
    `;

    const iframe = labelDiv.querySelector('iframe');
    const spinner = contentDiv.querySelector('.loading-spinner');
	   
	    // Show Label
    labelDiv.classList.add('active');
	    
	    iframe.addEventListener('load', () => {
	console.log('Iframe loaded');
	    
	// Hide loading spinner when iframe finishes loading
      spinner.style.display = 'none';
      iframe.style.pointerEvents = 'all'; // Enable iframe interaction after loading
      */ /*iframe.contentWindow.addEventListener('blur', () => {
	console.log('Iframe lost focus');
        controls.enabled = true; // Re-enable the controls when iframe loses focus
      });*/ /*
		    // Close any previously active label
      if (activeLabel && activeLabel !== labelDiv) {
        activeLabel.classList.remove('active');
      }
		    // Set the new active label
      activeLabel = labelDiv;
	    
    });
	  // Show loading spinner
    //const loadingIcon = document.getElementById('loadingIcon');
    //loadingIcon.style.display = 'block';
	  
    // Add a listener to detect when the iframe loses focus and re-enable the controls
    console.log(iframe); // Check if the iframe element is being correctly selected
	  
	*/    
// Close iframe when clicking outside of it
	  
    // Close iframe when clicking outside of it
    /*document.addEventListener('click', function(event) {
  if (!labelDiv.contains(event.target)) {
    // Check if the label is already active, toggle it off
    if (labelDiv.classList.contains('active')) {
      labelDiv.classList.remove('active');
      controls.autoRotate = true;
      controls.enabled = true;
    } else {
      // Re-enable the iframe on click
      labelDiv.classList.add('active');
      controls.autoRotate = false;
      controls.enabled = false;
    }
  }
});*/    
/*        document.addEventListener('pointerdown', function(event) {
          if (!labelDiv.contains(event.target)) {
          labelDiv.classList.remove('active');
          controls.autoRotate = true;
          controls.enabled = true;
          activeLabel = null; // No active label after close
        }
      });

	    // Stop the globe's autorotation and disable OrbitControls
    controls.autoRotate = false;
    controls.enabled = false; // Disable the controls while interacting with the iframe

  }
}
});*/
	  // Define different markers data sets
const markersDataSets = {
  cheapest: markersDataforCheapestAirbnbs,
  midPrice: markersDataforMidPriceAirbnbs,
  expensive: markersDataforExpensiveAirbnbs,
};

let activeMarkersData = markersDataforCheapestAirbnbs; // Default to cheapest
let activeLabel = null; // Keep track of open iframe
//let markers; // Declare it outside, so it is accessible globally.

function loadMarkers(selectedCategory) {
  // Remove existing markers from the scene
  scene.remove(markers);
	
// Set active markers data
  activeMarkersData = markersDataSets[selectedCategory];

  // Create new markers for the selected category
  //const markerCount = activeMarkersData.length;
  //const markers = new THREE.InstancedMesh(markerGeometry, markerMaterial, markerCount);
  //const dummy = new THREE.Object3D();

  activeMarkersData.forEach((data, index) => {
    const [radius, phi, theta] = data.position;
    dummy.position.setFromSphericalCoords(radius, phi, theta);
    dummy.lookAt(dummy.position.clone().setLength(radius + 1));
    dummy.updateMatrix();
    markers.setMatrixAt(index, dummy.matrix);
    data.worldPosition = dummy.position.clone();
  });

  scene.add(markers);

  // Add interactivity to the new markers
  setupMarkerInteraction();
}
	  
// Set up marker click event
function setupMarkerInteraction() {
  window.addEventListener('pointerdown', (event) => {
    pointer.x = (event.clientX / innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObject(markers).filter((m) => {
      return m.uv.subScalar(0.5).length() * 2 < 0.25;
    });

    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId;
      const data = activeMarkersData[instanceId];

	    // Update Label Content
      const labelDiv = document.getElementById(`label-${data.id}`);
      const contentDiv = labelDiv.querySelector('.content');

	    // Check if the iframe is already loaded
	    if (!contentDiv.querySelector('iframe')) {
		    // Always update the content and attach the iframe, even if previously clicked
    contentDiv.innerHTML = `
      <div class="loading-spinner" style="pointer-events:none;"></div>
      <iframe src="${data.iframeSrc}" frameborder="0" width="275" height="249" scrolling="yes" allowfullscreen="true" sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox" loading="eager"></iframe>
    `;
    labelDiv.classList.add('active');
    controls.autoRotate = false;
    controls.enabled = false;

    // Disable pointer events on the globe while interacting with the iframe
    renderer.domElement.style.pointerEvents = 'none';
		    
    const iframe = labelDiv.querySelector('iframe');
    const spinner = contentDiv.querySelector('.loading-spinner');

	   iframe.addEventListener('load', () => {
          spinner.style.display = 'none';
          iframe.style.pointerEvents = 'all';
        });
    labelDiv.classList.add('active');

        // Close any previously active label
        if (activeLabel && activeLabel !== labelDiv) {
          activeLabel.classList.remove('active');
        }
        activeLabel = labelDiv;
}
	    // Remove previous `pointerdown` listeners if any
    document.removeEventListener('pointerdown', closeIframe);

    // Add event listener to close iframe when clicking outside
    document.addEventListener('pointerdown', closeIframe);
    }
  });
	// Function to close the active iframe if clicked outside
function closeIframe(event) {
  if (activeLabel && !activeLabel.contains(event.target)) {
    activeLabel.classList.remove('active');
    controls.autoRotate = true;
    controls.enabled = true;
    renderer.domElement.style.pointerEvents = 'all'; // Re-enable interaction with the globe
    activeLabel = null; // Clear the active label
}
}
}
	  // Add event listener for dropdown selection
document.getElementById('airbnbSelector').addEventListener('change', function() {
  const selectedCategory = this.value;
  loadMarkers(selectedCategory);
});

// Load markers for default category on page load
loadMarkers('cheapest');
		    
	 /* let activeLabel = null; // Keep track of the currently open iframe

window.addEventListener('pointerdown', (event) => {
  pointer.x = (event.clientX / innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObject(markers).filter((m) => {
    return m.uv.subScalar(0.5).length() * 2 < 0.25;
  });

  if (intersects.length > 0) {
    const instanceId = intersects[0].instanceId;
    const data = markersData[instanceId];

    // Update Label Content
    const labelDiv = document.getElementById(`label-${data.id}`);
    const contentDiv = labelDiv.querySelector('.content');

    // Always update the content and attach the iframe, even if previously clicked
    contentDiv.innerHTML = `
      <div class="loading-spinner" style="pointer-events:none;"></div>
      <iframe src="${data.iframeSrc}" frameborder="0" width="275" height="249" scrolling="yes" allowfullscreen="true" sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox" loading="eager"></iframe>
    `;

    const iframe = labelDiv.querySelector('iframe');
    const spinner = contentDiv.querySelector('.loading-spinner');

    labelDiv.classList.add('active');
    controls.autoRotate = false;
    controls.enabled = false;

    // Disable pointer events on the globe while interacting with the iframe
    renderer.domElement.style.pointerEvents = 'none';

    iframe.addEventListener('load', () => {
      spinner.style.display = 'none';
      iframe.style.pointerEvents = 'all'; // Enable iframe interaction after loading

      // Close any previously active label
      if (activeLabel && activeLabel !== labelDiv) {
        activeLabel.classList.remove('active');
      }

      // Set the new active label
      activeLabel = labelDiv;
    });

    // Remove previous `pointerdown` listeners if any
    document.removeEventListener('pointerdown', closeIframe);

    // Add event listener to close iframe when clicking outside
    document.addEventListener('pointerdown', closeIframe);
  }
});

// Function to close the active iframe if clicked outside
function closeIframe(event) {
  if (activeLabel && !activeLabel.contains(event.target)) {
    activeLabel.classList.remove('active');
    controls.autoRotate = true;
    controls.enabled = true;
    renderer.domElement.style.pointerEvents = 'all'; // Re-enable interaction with the globe
    activeLabel = null; // Clear the active label
  }
}
}*/




	  // Loading spinner functionality
/*document.getElementById('labels-container').addEventListener('click', function() {
  const loadingIcon = document.getElementById('loadingIcon');
  
  // Show loading icon when iframe is clicked
  loadingIcon.style.display = 'block';
  
  // Hide the loading icon after a set timeout (3 seconds in this case)
  setTimeout(() => {
    loadingIcon.style.display = 'none';
  }, 3000); // Adjust time as needed
});*/



// Animation Loop
//const clock = new THREE.Clock();
// Animation loop that ensures the TWEEN library is updated
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    
    // Update tween animations
    TWEEN.update();
	
    // Update time uniform for any shaders if needed
    globalUniforms.time.value = clock.getElapsedTime();

    // Update controls
    if (controls.enabled) {
        controls.update();
    }

    // Render the scene
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera); // If you're using labelRenderer
}

animate(); // Start the animation loop
	  
/*function animate() {
  requestAnimationFrame(animate);
  TWEEN.update(); // Required to make the transition work
  // Update time uniform
  globalUniforms.time.value = clock.getElapsedTime();
	
  // Update controls
  if (controls.enabled) {
    controls.update();
  }

  // Render
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

animate();*/

  </script>

