<?php declare(strict_types=1);

$base_path = '/weiterleitung/';

session_set_cookie_params([
    'path' => $base_path,
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

function redirect($url)
{
    header("Location: $url", true, 303);
    exit;
}

function forbidden()
{
    session_destroy();
    header('HTTP/1.1 403 Forbidden');
    echo "403 Forbidden";
    exit;
}

function post($url, $data)
{
    return file_get_contents($url, false, stream_context_create([
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data),
        ],
    ]));
}

function check_session()
{
    if (!isset($_SESSION['last_activity']) || time() - $_SESSION['last_activity'] > 60 * 60) {
        return false;
    } else {
        $_SESSION['last_activity'] = time();
        return true;
    }
}

function do_login()
{
    global $base_path;

    $client_id = 'weiterleitung';
    $client_secret = 'CHANGEME';
    $authorization_endpoint = 'https://kub.dyndns.berlin/sso/login/';
    $token_endpoint = 'https://kub.dyndns.berlin/sso/token/';

    if (isset($_GET['code'])) {
        $response = post($token_endpoint, [
            'client_id' => $client_id,
            'client_secret' => $client_secret,
            'grant_type' => 'authorization_code',
            'code' => $_GET['code'],
        ]);
        if ($response) {
            $_SESSION['last_activity'] = time();
            redirect($base_path);
        } else {
            forbidden();
        }
    } else {
        redirect($authorization_endpoint . '?' . http_build_query([
            'client_id' => $client_id,
            'redirect_uri' => "https://${_SERVER['HTTP_HOST']}$base_path",
            'response_type' => 'code',
            'scope' => 'openid',
        ]));
    }
}
