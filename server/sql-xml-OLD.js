function loadDB() {
    var searchURL = 'markers.php';
    downloadUrl(searchURL, function(data) {
        var xml = parseXml(data);
        var markerNodes = xml.documentElement.getElementsByTagName("marker");
        for (var i = 0; i < markerNodes.length; i++) {
            var category = markerNodes[i].getAttribute("category");
            var name = markerNodes[i].getAttribute("name");
            var address = markerNodes[i].getAttribute("address");
            var lat = markerNodes[i].getAttribute("lat");
            var lng = markerNodes[i].getAttribute("lng");
            markersData.push({
                category: category,
                name: name,
                address: address,
                lat: lat,
                lng: lng
            });
        }
    });
}

function downloadUrl(url, callback) {
    var request = window.ActiveXObject ?
    new ActiveXObject('Microsoft.XMLHTTP') :
    new XMLHttpRequest;
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            request.onreadystatechange = doNothing;
            callback(request.responseText, request.status);
        }
    };
    request.open('GET', url, true);
    request.send(null);
}

function parseXml(str) {
    if (window.ActiveXObject) {
        var doc = new ActiveXObject('Microsoft.XMLDOM');
        doc.loadXML(str);
        return doc;
    }
    else if (window.DOMParser) {
        return (new DOMParser).parseFromString(str, 'text/xml');
    }
}