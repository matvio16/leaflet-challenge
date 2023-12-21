// Function to help increase circl size
function markerSize(magnitude) {
    return magnitude * 10000;
  }

//Function to easier set colors for circles and legend
function getColor(d) {
    return d > 90 ? '#ff471a' :
           d > 70  ? '#cc8800' :
           d > 50  ? '#ffaa00' :
           d > 30  ? '#ffdd99' :
           d > 10   ? '#ccff66' :
                      '#00ff00';
    };

// function that will load the map and populate the earthquake circle markers
function createMap(earthquakes) {
  // Create the tile layer that will be the background of our map.
  let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create a baseMaps object to hold the streetmap layer.
  let baseMaps = {
    "Street Map": streetmap
  };

  // Create an overlayMaps object to hold the earthquakes layer.
  let overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create the map object with options.
  let map = L.map("map", {
    center: [38.39, -100.19],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  // Add the legend
  let legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {

  let div = L.DomUtil.create('div', 'info legend');
  labels = [];
  categories = ['-10-10','10-30','30-50','50-70','70-90','90+'];
  values = [0,20,40,60,80,100]

  for (var i = 0; i < categories.length; i++) {
          div.innerHTML += 
          labels.push(
            '<i style="background: ' + getColor(values[i]) + '"></i> ' +
            '<span>' + categories[i] + '</span>');
    }
    div.innerHTML = labels.join('<br>');
    return div;
  };
  legend.addTo(map);
}

//Function to create the markers based of the latitude and longitude, along with the color based on depth and size based on magnitude
function createMarkers(response) {

  // Pull the "quake" property from response.features.
  let quakes = response.features;

  // Initialize an array to hold the earthquake circles.
  let earthquakes = [];

  // Loop through the quake array.
  for (let index = 0; index < quakes.length; index++) {
    let quake = quakes[index];

    // For each quake, create a marker, and bind a popup with the eartquake's location, magnitude and depth.
    let eqMarker = L.circle([quake.geometry.coordinates[1], quake.geometry.coordinates[0]], {
        stroke: false,
        fillOpacity: 0.75,
        color: getColor(quake.geometry.coordinates[2]),
        fillColor: getColor(quake.geometry.coordinates[2]),
        radius: markerSize(quake.properties.mag)
      })
      .bindPopup(`<h2>${quake.properties.place}<h2> <hr> <h3>Magnitude: ${quake.properties.mag}, Depth: ${quake.geometry.coordinates[2]}</h3>`);

    // Add the marker to the earthquakes array.
    earthquakes.push(eqMarker);
  }

  // Create a layer group that's made from the earthquakes array, and pass it to the createMap function.
  createMap(L.layerGroup(earthquakes));

}

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(createMarkers);
