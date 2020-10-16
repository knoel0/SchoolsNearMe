<?php

/* // Fetch the marker info from the database
$markerresult = $db->query("SELECT * FROM Business");

// Fetch the info-window data from the database
$infowinresult = $db->query("SELECT * FROM Business"); */

require_once 'dbConfig.php';

function parseToXML($htmlStr) {
    $xmlStr=str_replace('<','&lt;',$htmlStr);
    $xmlStr=str_replace('>','&gt;',$xmlStr);
    $xmlStr=str_replace('"','&quot;',$xmlStr);
    $xmlStr=str_replace("'",'&#39;',$xmlStr);
    $xmlStr=str_replace("&",'&amp;',$xmlStr);
    return $xmlStr;
}

$dbSelected = mysqli_select_db($db, $dbName);
if (!$dbSelected) {
    error_log("Database selection failed: " . mysqli_error($db));
    die('Internal server error');
}

// Select all the rows in the markers table
$query = "SELECT * FROM Business WHERE 1";
$result = mysqli_query($db, $query);
if (!$result) {
    die("Invalid query: " . mysqli_error($db));
}

header("Content-type: text/xml");

// Start XML file, echo parent node
echo "<?xml version='1.0' ?>";
echo '<markers>';
$ind=0;
// Iterate through the rows, printing XML nodes for each
while ($row = @mysqli_fetch_assoc($result)) {
    // Add to XML document node
    echo '<marker ';
    echo 'id="' . $row['id'] . '" ';
    echo 'category="' . parseToXML($row['category']) . '" ';
    echo 'name="' . parseToXML($row['name']) . '" ';
    echo 'address="' . parseToXML($row['address']) . '" ';
    echo 'lat="' . $row['latitude'] . '" ';
    echo 'lng="' . $row['longitude'] . '" ';
    echo '/>';
    $ind = $ind + 1;
}

// End XML file
echo '</markers>';

?>
