const socket = io();
const map = L.map("map").setView([19.160334, 77.315097], 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Custom bus icon configuration
const busIcon = L.icon({
  iconUrl: "/images/bus-icon.png", // Path to the bus icon
  iconSize: [40, 40],             // Size of the icon
  iconAnchor: [20, 20],           // Anchor point of the icon
});

const busMarkers = {}; // Object to store markers for buses

// Add or update markers using the custom icon
socket.on("bus-data", (buses) => {
  buses.forEach((bus) => {
    const { id, latitude, longitude, name, route } = bus;

    if (busMarkers[id]) {
      // Update existing marker position
      busMarkers[id].setLatLng([latitude, longitude]);
    } else {
      // Create a new marker with the custom bus icon
      busMarkers[id] = L.marker([latitude, longitude], { icon: busIcon })
        .addTo(map)
        .bindPopup(`<b>${name}</b><br>${route}`);
    }
  });

  // Update table dynamically
  const tableBody = document.getElementById("bus-table-body");
  if (tableBody) {
    tableBody.innerHTML = buses
      .map(
        (bus) =>
          `<tr>
            <td>${bus.name}</td>
            <td>${bus.route}</td>
            <td>${bus.latitude.toFixed(5)}, ${bus.longitude.toFixed(5)}</td>
            <td>${bus.schedule}</td>
          </tr>`
      )
      .join("");
  }
});
