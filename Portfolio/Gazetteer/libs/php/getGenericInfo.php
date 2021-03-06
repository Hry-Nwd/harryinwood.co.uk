<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    // get country border feature

    $countryBorders = json_decode(file_get_contents("countryBorders.geo.json"), true);

    $border = null;

    foreach ($countryBorders['features'] as $feature) {

        if ($feature["properties"]["iso_a2"] ==  $_REQUEST['countryCode']) {

            $border = $feature;
            break;
        
        }
        
    }

    // first API call

    $url='https://restcountries.eu/rest/v2/alpha/' . $_REQUEST['countryCode'];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);

    curl_close($ch);

    $info = json_decode($result,true);        

    //

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data']['border'] = $border;
    $output['data']['info'] = $info;

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>
