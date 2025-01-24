const socket = io();

// Initialize the map
const map = L.map("map").setView([0, 0], 2);  // Global view by default

// Tile layer for OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
}).addTo(map);

// Custom bus icon
const busIcon = L.icon({
    iconUrl: '/images/bus-icon.png',  // Make sure the bus icon is in the public/images/ folder
    iconSize: [30, 30],  // Resize the icon
    iconAnchor: [15, 15],  // Center the icon
    popupAnchor: [0, -15] // Adjust where the popup appears (if any)
});

// Object to track bus markers
const markers = {};

// Listen for location updates from the server
socket.on("receive-location", (data) => {
    const { id, latitude, longitude, locationName } = data;

    // Check if this bus already has a marker
    if (markers[id]) {
        // Update existing marker position
        markers[id].setLatLng([latitude, longitude]);
        markers[id].bindPopup(locationName || "Unknown location");
    } else {
        // Add a new marker if it's a new bus
        markers[id] = L.marker([latitude, longitude], { icon: busIcon }).addTo(map);
        markers[id].bindPopup(locationName || "Unknown location");
    }
});

// Handle user disconnection and remove markers
socket.on("user-disconnected", (data) => {
    const { id } = data;

    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
