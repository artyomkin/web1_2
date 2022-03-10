<?php
    $start_time = microtime(true);

    $x = $_GET["x"];
    $y = $_GET["y"];
    $R = $_GET["R"];

    $hit =
        (($x >= 0 && $y >= 0) && ($x <= $R && $y <= $R/2)) ||
        (($x >= 0 && $y <= 0) && ($x * $x + $y * $y <= $R * $R/4)) ||
        (($x <= 0 && $y <= 0) && ($y >= -$x/2 - $R));
    
    date_default_timezone_set('Etc/GMT-3');

    $current_time = date("h:i:s A");
    $working_time = round(10**6 * (microtime(true) - $start_time));

    $result = json(array(
                "x" => $x,
                "y" => $y,
                "R" => $R,
                "hit" => $hit,
                "current_time" => $current_time,
                "working_time" => $working_time
    ));

    echo $result;
    /*echo "\n".json_encode(array(
                "x" => $x,
                "y" => $y,
                "R" => $R,
                "hit" => $hit,
                "current_time" => $current_time,
                "working_time" => $working_time));*/

    function json($values) {
        $result =
            "{" .

            "\"x\":" . "\"" . (string)$values["x"] . "\"," .

            "\"y\":" . "\"" . (string)$values["y"] . "\"," .

            "\"R\":" . "\"" . (string)$values["R"] . "\"," .

            "\"hit\":" . boolToStr($values["hit"]) . "," .

            "\"current_time\":" . "\"" . (string)$values["current_time"] . "\"," .

            "\"working_time\":" . (string)$values["working_time"]

            . "}";

        return $result;
        
    } 

    function boolToStr($val) {
        if ($val) {
            return "true";

        } else {
            return "false";

        }
    }
?>