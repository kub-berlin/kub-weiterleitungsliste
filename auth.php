<?php declare(strict_types=1);

$base_path = '/sprachmittlung/';

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

function b64($bytes)
{
    $b64 = base64_encode($bytes);
    return rtrim(strtr($b64, '+/', '-_'), '=');
}

function sha256($bytes)
{
    return b64(hash('sha256', $bytes, true));
}

function check_session()
{
    if (!isset($_SESSION['last_activity']) || time() - $_SESSION['last_activity'] > 60 * 30) {
        return false;
    } elseif (!isset($_SESSION['logged_in_at']) || time() - $_SESSION['logged_in_at'] > 60 * 60 * 8) {
        return false;
    } else {
        $_SESSION['last_activity'] = time();
        return true;
    }
}

function do_login()
{
    global $base_path;

    $client_id = 'sprachmittlung';
    $client_secret = 'CHANGEME';
    $authorization_endpoint = 'https://kub.dyndns.berlin/sso/login/';
    $token_endpoint = 'https://kub.dyndns.berlin/sso/token/';

    if (isset($_GET['code'])) {
        if (time() - $_SESSION['started'] > 5 * 60) {
            forbidden();
        }
        if ($_GET['state'] !== $_SESSION['state']) {
            forbidden();
        }
        $response = post($token_endpoint, [
            'client_id' => $client_id,
            'client_secret' => $client_secret,
            'grant_type' => 'authorization_code',
            'code' => $_GET['code'],
            'code_verifier' => $_SESSION['code_verifier'],
        ]);
        if ($response) {
            $_SESSION['last_activity'] = time();
            $_SESSION['logged_in_at'] = time();
            redirect($base_path);
        }
        forbidden();
    } else {
        $_SESSION['started'] = time();
        $_SESSION['state'] = b64(random_bytes(32));
        $_SESSION['code_verifier'] = b64(random_bytes(64));
        redirect($authorization_endpoint . '?' . http_build_query([
            'client_id' => $client_id,
            'redirect_uri' => "https://${_SERVER['HTTP_HOST']}$base_path",
            'response_type' => 'code',
            'scope' => 'openid',
            'state' => $_SESSION['state'],
            'code_challenge' => sha256($_SESSION['code_verifier']),
            'code_challenge_method' => 'S256',
        ]));
    }
}
