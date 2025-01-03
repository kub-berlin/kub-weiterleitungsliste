<?php declare(strict_types=1);

include_once('auth.php');

if (!check_session()) {
    do_login();
}

?><!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="de">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' unpkg.com *.tile.openstreetmap.org; script-src 'self' unpkg.com; style-src 'self' unpkg.com" />
        <title>Weiterleitungsmöglichkeiten</title>
        <meta name="viewport" content="width=device-width" />
        <link rel="stylesheet" type="text/css" href="static/style.css" />
        <link rel="stylesheet" href="//unpkg.com/leaflet@1.2.0/dist/leaflet.css" />
    </head>

    <body>
        <main>Wird geladen...</main>
        <script src="static/main.js" type="module"></script>
        <script src="//unpkg.com/leaflet@1.2.0/dist/leaflet.js"></script>
    </body>
</html>
