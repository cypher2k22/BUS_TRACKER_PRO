const axios = require("axios");
const polyline = require("polyline");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Helper to geocode an address to coordinates
 */
const geocode = async (address) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    if (response.data.status !== "OK") {
      throw new Error(`Geocoding failed for ${address}: ${response.data.status}`);
    }
    return response.data.results[0].geometry.location;
  } catch (error) {
    if (error.response) {
      console.error("❌ Geocoding API Error Response:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

/**
 * Route search controller
 */
const searchRoute = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: "Start and End locations are required" });
    }

    console.log(`🔎 Searching route from "${start}" to "${end}"`);

    // 1. Geocode start and end
    const startCoords = await geocode(start);
    const endCoords = await geocode(end);

    // 2. Get Route from Google Routes API (V2)
    const routesUrl = "https://routes.googleapis.com/directions/v2:computeRoutes";
    const routesBody = {
      origin: { location: { latLng: { latitude: startCoords.lat, longitude: startCoords.lng } } },
      destination: { location: { latLng: { latitude: endCoords.lat, longitude: endCoords.lng } } },
      travelMode: "DRIVE",
      polylineEncoding: "ENCODED_POLYLINE",
    };

    let routesResponse;
    try {
      routesResponse = await axios.post(routesUrl, routesBody, {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": "routes.polyline.encodedPolyline,routes.legs.steps",
        },
      });
    } catch (routeErr) {
      if (routeErr.response) {
        console.error("❌ Google Routes API Error Response:", JSON.stringify(routeErr.response.data, null, 2));
      }
      throw routeErr;
    }

    if (!routesResponse.data.routes || routesResponse.data.routes.length === 0) {
      return res.status(404).json({ message: "No route found" });
    }

    const route = routesResponse.data.routes[0];
    const encodedPolyline = route.polyline.encodedPolyline;
    
    // Decode polyline into [lat, lng] pairs and then objects {latitude, longitude}
    const decodedPoints = polyline.decode(encodedPolyline);
    const coordinates = decodedPoints.map(point => ({
      latitude: point[0],
      longitude: point[1]
    }));

    // 3. Extract sample points for Nearby Search
    const steps = route.legs[0].steps;
    const samplePoints = [startCoords, endCoords];
    
    steps.forEach((step, index) => {
        if (index % 5 === 0) {
            samplePoints.push({
                lat: step.endLocation.latLng.latitude,
                lng: step.endLocation.latLng.longitude
            });
        }
    });

    // 4. Find Bus Stations near sample points
    const stopsMap = new Map();
    const pointsToSearch = samplePoints.slice(0, 10);

    for (const point of pointsToSearch) {
      try {
        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${point.lat},${point.lng}&radius=3000&type=bus_station&key=${GOOGLE_MAPS_API_KEY}`;
        const placesResponse = await axios.get(placesUrl);
        
        if (placesResponse.data.results) {
          placesResponse.data.results.forEach(place => {
            stopsMap.set(place.place_id, {
              name: place.name,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              id: place.place_id
            });
          });
        }
      } catch (placeErr) {
        if (placeErr.response) {
          console.error("❌ Places API Error Response:", JSON.stringify(placeErr.response.data, null, 2));
        }
        console.warn("Place search failed", placeErr.message);
      }
    }

    const uniqueStops = Array.from(stopsMap.values());

    res.json({
      startLocation: { title: start, latitude: startCoords.lat, longitude: startCoords.lng },
      endLocation: { title: end, latitude: endCoords.lat, longitude: endCoords.lng },
      coordinates: coordinates,
      stops: uniqueStops
    });

  } catch (error) {
    if (error.response) {
      console.error("❌ API Error Detail:", JSON.stringify(error.response.data, null, 2));
    }
    console.error("❌ Route search error:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports = { searchRoute };
