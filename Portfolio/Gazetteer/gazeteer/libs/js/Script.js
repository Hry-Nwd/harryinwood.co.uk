//!  ------ Global Variables ------
//* --- Globals ---
let userLat = "" 
let userLng = ""
let userCountry = ""
let selectedCountry = ""
let selectedCountryCode = ""
let border = {}
//* --- DOM ---
const countrySelect = $('#country-sel');

const close = $('#close')
const menu = $('#menuBtn')


//! ------ Leaflet.js Setup ------
  //* --- Base layers ---   
const WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

const WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
const WorldPhysical = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
	maxZoom: 8
});

const NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	maxZoom: 10
});
//* --- Layer object ---
const baseMaps = {
       
    "Street Map": WorldStreetMap,
    "Satellite" : WorldImagery,
    "Terrain" : WorldPhysical,
    "National Geographic": NatGeoWorldMap

};
//* --- Map Initialization ---
const map = L.map('map', {
    center: [39.73, -104.99],
    zoom: 10,
    maxZoom: 10,
    layers: [WorldStreetMap],
    zoomControl : false
    });
//* --- Controls --- 
L.control.layers(baseMaps, null, {position: 'bottomright'} ).addTo(map)

//! ------ Functions ------
const getInfo = (code) => {

    $.ajax({
        url: "libs/php/getInfo.php",
        type: "POST",
        dataType: 'json',
        data: {
            countryCode: code
        },

        success: function(result){

           

            if (map.hasLayer(border)) {
                map.removeLayer(border);
            }
        
            border = L.geoJson(result.data.border,{
                color: '#FF0000',
                weight: 2,
                opacity: 0.65
            }).addTo(map);         
        
            map.fitBounds(border.getBounds());

            selectedCountry = result.data.border.properties.name
            selectedCountryCode = result.data.border.properties.iso_a2
            
            //* Setting flag and infocard title
            $('#flag').attr("src", `https://www.countryflags.io/${selectedCountryCode}/flat/64.png`)
            $('#countryName').html(`${selectedCountry}`)

            //*General information tab
            let wikiLink = ""

            $.ajax({
                url: "libs/php/getWikiLink.php",
                type: "POST",
                data: {
                    capital: result.data.info.capital,
                    countryCode: code
                },

                success: function(result){
                    wikiLink = result.data.link.geonames[0].wikipediaUrl
                    console.log(wikiLink)
                    $('#wikiBtn').attr('href', `https://${wikiLink}`)
                    
                }
            })
            $('#generalInfo').html(`${result.data.info.capital} is the capital of ${selectedCountry}.<br><br> ${result.data.info.languages[0].name} is the main spoken language by approximately ${result.data.info.population} people.<br><br> You can find out more over on wikipedia`);
            
        } 
    })
}


//!  ------ Event Listeners ------
countrySelect.on('change', () => {
    getInfo(countrySelect.val())
})

close.on('click', () => {
    $('#infocard').addClass('close')
    menu.removeClass('close')
})

menu.on('click', () => {
    $('#infocard').removeClass('close')
    menu.addClass('close')
})

//! ------ Document Ready ------
$(document).ready(function(){
    
    
    $.ajax({
        url: "./libs/php/getCountryCode.php",
        type: "POST",
        dataType: 'json',
        
        success: function(result) {
            
            result.data.forEach(datum => {
                countrySelect.append(`<option value="${datum.code}">${datum.name}</option>`);
            } )
            
        }
    })
    
    navigator.geolocation.getCurrentPosition((position) => {
            userLat = position.coords.latitude;
            userLng = position.coords.longitude;
            $.ajax({
                url: "./libs/php/getUserCountry.php",
                type: "POST",
                dataType: "json",
                data: {
                    lat: userLat,
                    lng: userLng
                },
                success : function(result){
                    getInfo(result.data)
                   countrySelect.children(`option[value='${result.data}']`).prop('selected', true);
                   userCountry = result.data

                }
            })
          });
})
