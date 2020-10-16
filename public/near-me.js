var map;
var infoWindow;
var markersData = [];
var markers = [];
var markersInfoDiv = document.getElementById("locations_info");
var autoCompleteObj;
var autoCompleteInput = document.getElementById('search_input');
var filters = [];

var getGeolocation = function() {
    return new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            maximumAge: 0
        });    
    });
}

function updateFromSearch() {
    var placeResultObj = autoCompleteObj.getPlace();
    var placeLatLng = placeResultObj.geometry.location;
    map.setCenter(placeLatLng);
    map.setZoom(15);
    sortMarkersByDistance();
    showMarkers();
}

function updateFromFilter() {
    showMarkers();
}

function initMap() {
    loadDB();
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.656326, lng: -79.380902},
        zoom: 11,
        mapTypeId: 'roadmap'
    });
    infoWindow = new google.maps.InfoWindow();
    getGeolocation()
        .then((position) => {
            map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: position.coords.latitude, lng: position.coords.longitude},
                zoom: 13,
                mapTypeId: 'roadmap'
            });
            createMarkerArr();
            createFilterArr();
            showFilterBtns();
            sortMarkersByDistance();
            showMarkers();
        })
        .catch((err) => {
            console.error(err.message);
        });
    var autoCompDefaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(41.6765556, -95.1537399),
        new google.maps.LatLng(8593635, -74.3201062)
    );
    var autoCompOptions = {
        bounds: autoCompDefaultBounds
    };
    autoCompleteObj = new google.maps.places.Autocomplete(autoCompleteInput, autoCompOptions);
    autoCompleteObj.setFields(["geometry"]);
    autoCompleteObj.addListener("place_changed", updateFromSearch);
}

function loadDB() {
    var firebaseConfig = {
        apiKey: "AIzaSyATx36Su9y9_exD8NVC8rYwaX6mgk25Y7Q",
        authDomain: "nearme-app-8a385.firebaseapp.com",
        databaseURL: "https://nearme-app-8a385.firebaseio.com",
        projectId: "nearme-app-8a385",
        storageBucket: "nearme-app-8a385.appspot.com",
        messagingSenderId: "330261440574",
        appId: "1:330261440574:web:326efdf2d5154593cc896f",
        measurementId: "G-MNBFFHFXJY"
    };
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
    db.collection("schools").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var name = doc.id;
            var docData = doc.data();
            var address = docData["address"].toString();
            var category = docData["category"].toString();
            var lat = docData["coordinates"].latitude;
            var lng = docData["coordinates"].longitude;
            markersData.push({
                category: category,
                name: name,
                address: address,
                lat: lat,
                lng: lng
            });
        });
    });
}

function createMarkerArr() {
    for (var i = 0; i < markersData.length; i++) {
        createMarker(markersData[i]);
    }
}

function createMarker(marker) {
    var latLng = new google.maps.LatLng (
        marker.lat,
        marker.lng
    );
    var markerTemp = new google.maps.Marker ({
        map: map,
        position: latLng,
        visible: false,
        category: marker.category,
        name: marker.name,
        address: marker.address
    });
    var contentString = "<h1>" + markerTemp.name + "</h1>" + "<p>" + markerTemp.address + "</p>" + "<p>" + markerTemp.category + "</p>";
    markerTemp.addListener("click", function() {
        infoWindow.close();
        infoWindow.setContent(contentString);
        infoWindow.open(map, markerTemp);
    });
    markers.push(markerTemp);
}

function createFilterArr() {
    let filterNames = new Set();
    for (var i = 0; i < markers.length; i++) {
        filterNames.add(markers[i].category);
    }
    filterNames.forEach(filter => {
        filters.push({
            name: filter,
            state: true
        });
    });
}

function showFilterBtns() {
    for (var i = 0; i < filters.length; i++) {
        let btn = document.createElement("BUTTON");
        btn.setAttribute("class", "filterBtn")
        btn.setAttribute("type", "button");
        btn.innerHTML = filters[i].name;
        btn.addEventListener("click", () => {
            filterToggle(btn.innerHTML);
            updateFromFilter();
        });
        document.getElementById("filters").appendChild(btn);
    }
}

function getMarkerDistance(marker) {
    var distanceKM = ((google.maps.geometry.spherical.computeDistanceBetween(map.getCenter(), marker.position)) / 1000).toFixed(1);
    return parseFloat(distanceKM);
}

function sortMarkersByDistance() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].distance = getMarkerDistance(markers[i]);
    }
    markers.sort(function(a, b) {
        return a.distance - b.distance;
    });
}

function showMarkerInfo(marker) {
    var div = document.createElement("div");
    div.innerHTML = "<b>" + marker.name + "</b>" + "<br/>" + marker.distance + "km" + "<br/>" + marker.address + "<br/>" + "<i>" + marker.category + "</i>";
    document.getElementById("locations_info").appendChild(div);
}

function showMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setVisible(false);
    }
    markersInfoDiv.textContent = '';
    for (var i = 0; i < markers.length; i++) {
        var index = filters.findIndex(a => a.name == markers[i].category);
        if (filters[index].state == true) {
            markers[i].setVisible(true);
            showMarkerInfo(markers[i]);
        }
    }
}

function switchAllOn() {
    for (var i = 0; i < filters.length; i++) {
        filters[i].state = true;
    }
}

function switchOneOn(name) {
    for (var i = 0; i < filters.length; i++) {
        if (filters[i].name == name) {
            filters[i].state = true;
        }
    }
}

function switchAllOff() {
    for (var i = 0; i < filters.length; i++) {
        filters[i].state = false;
    }
    for (var i = 0; i < filters.length; i++) {
    }
}

function areAllOn() {
    var filterStates = [];
    for (var i = 0; i < filters.length; i++) {
        filterStates.push(filters[i].state);
    }
    if (filterStates.every(Boolean)) {
        return true;
    }
    else {
        return false;
    }    
}

function isOneOn(name) {
    for (var i = 0; i < filters.length; i++) {
        if (filters[i].name == name && filters[i].state == true) {
            return true;
        }
    }
    return false;
}

function filterToggle(filterName) {
    if (areAllOn()) {
        switchAllOff();
        switchOneOn(filterName);
        return;
    }
    if (!areAllOn()) {
        for (var i = 0; i < filters.length; i++) {
            if (isOneOn(filterName)) {
                switchAllOn();
                return;
            }
            if (!isOneOn(filterName)) {
                switchAllOff();
                switchOneOn(filterName);
                return;
            }    
        }
    }
}