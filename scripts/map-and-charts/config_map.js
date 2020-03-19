// THIS IS A DEMO MAP POWERED WITH LEAFLET
const mymap = L.map('map', {
  zoomControl: false,
  preferCanvas: true
 }).setView([10.832, 7.427], 5)
// SET THE ZOOM ICONS TO THE TOPRIGHT CORNER
new L.Control.Zoom({ position: 'topright' }).addTo(mymap)

// ADD A BASEMAP
const esri = L.esri.tiledMapLayer({
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer'
}).addTo(mymap);
const satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1IjoiY2FydG9saXZpZXIiLCJhIjoiY2ptN2F4Y2huMDFqMjNrbW1oM2Z0cmJnayJ9.hgdKRVi2rOaI1LRAq-oj7A'
})
const light = L.tileLayer('https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, CartoDb'
})
const esriStreet = L.esri.tiledMapLayer({
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
})
const osm = L.tileLayer('https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
})
const hot = L.tileLayer('https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
})

const baselayers = L.layerGroup([esri,satellite,light,esriStreet,osm,hot])

// Change baselayer
$('.baselayer-icon').click(function(e){
  $('.baselayer-icon').each(function(i, v){
    if ($(this).hasClass('selected-layer')) {
      $(this).removeClass('selected-layer')
    }
  })
  $(this).addClass('selected-layer')
  const selectedLayer = e.target.id
  baselayers.eachLayer(function(layer){
    if (mymap.hasLayer(layer)) {
      mymap.removeLayer(layer)
    }
  })
  eval(selectedLayer+'.addTo(mymap)')
})


// Boundaries Layers
const myStyle = {
  "weight": 1,
  "color": "#000",
  "opacity": 0.7,
  "fillColor": "#fff",
  "fillOpacity": 0.3
};

//Using Leaflet Omnivore to avoid CORS issues
const customLayer1 = L.geoJson(null, {
    style: myStyle,
    onEachFeature: MapInteraction
});
const customLayer2 = L.geoJson(null, {
    style: myStyle,
    onEachFeature: MapInteraction
});
const customLayer3 = L.geoJson(null, {
    style: myStyle,
    onEachFeature: MapInteraction
});
const customLayer4 = L.geoJson(null, {
    style: myStyle,
    onEachFeature: MapInteraction
});

const boundarieslayers = L.layerGroup()
let level4Layer
let level3Layer
let level2Layer
let level1Layer
let labels




// const boundarieslayers = L.layerGroup([level4Layer, level3Layer, level2Layer, level1Layer])
