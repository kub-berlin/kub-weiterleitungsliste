<?php declare(strict_types=1);

// ini_set('display_errors', 'On');

function get_database()
{
    $db = new PDO('sqlite:begleitung.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, false);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $db->query('CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY,
        name TEXT,
        mtime INTEGER,
        category TEXT,
        subcategory TEXT,
        gender TEXT,
        email TEXT,
        phone TEXT,
        availability TEXT,
        lang TEXT,
        note TEXT,
        rev TEXT
    );');

    $db->query('CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE,
        password_hash TEXT,
        is_admin BOOL
    );');

    $db->query('CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY,
        user INTEGER,
        expires INTEGER,
        token TEXT
    );');

    return $db;
}

function get_user($db)
{
    $stmt = $db->query('DELETE FROM sessions WHERE expires < :now');
    $stmt->execute(array('now' => time()));

    $stmt = $db->prepare('SELECT user FROM sessions WHERE token = :token');
    $stmt->execute(array('token' => $_COOKIE['begleitung_session']));
    $session = $stmt->fetch();

    $stmt = $db->prepare('SELECT * FROM users WHERE id = :id');
    $stmt->execute(array('id' => $session['user']));
    return $stmt->fetch();
}

function create_session($db, $user)
{
    $token = bin2hex(random_bytes(42));
    $expires = time() + 60 * 60 * 24;
    $stmt = $db->prepare('INSERT INTO sessions (token, expires, user) VALUES (:token, :expires, :user)');
    $stmt->execute(array(
        'token' => $token,
        'expires' => $expires,
        'user' => $user['id'],
    ));
    setcookie('begleitung_session', $token, array(
        'expires' => $expires,
        'secure' => true,
        'samesite' => 'Strict',
    ));
}

function check_password($db, $name, $password)
{
    $stmt = $db->prepare('SELECT * FROM users WHERE name = :name');
    $stmt->execute(array('name' => $name));
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        return $user;
    }
}

$db = get_database();
$user = get_user($db);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (empty($user)) {
        header('HTTP/1.1 403 Forbidden');
        die();
    }

    $result = $db->query('SELECT * from entries')->fetchAll();
    if ($_GET['format'] === 'csv') {
        header('Content-Type: text/csv');
        $out = fopen('php://output', 'w');
        foreach ($result as $row) {
            fputcsv($out, $row);
        }
        fclose($out);
    } else {
        echo json_encode($result);
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    # FIXME: do server-side validation

    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($user)) {
        $user = check_password($db, $data['name'], $data['password']);
        if (empty($user)) {
            header('HTTP/1.1 403 Forbidden');
        } else {
            create_session($db, $user);
            header('HTTP/1.1 204 No Content');
        }
        die();
    }

    if (!array_key_exists('name', $data)) {
        $sql = 'DELETE from entries WHERE id=:id';
    } else {
        $data['mtime'] = time();
        if (array_key_exists('id', $data)) {
            $sql = 'UPDATE entries SET
                name=:name,
                mtime=:mtime,
                category=:category,
                subcategory=:subcategory,
                gender=:gender,
                email=:email,
                phone=:phone,
                availability=:availability,
                lang=:lang,
                note=:note,
                rev=:rev
                WHERE id=:id';
        } else {
            $sql = 'INSERT INTO entries
                (name, mtime, category, subcategory, gender, email, phone, availability, lang, note, rev)
                VALUES
                (:name, :mtime, :category, :subcategory, :gender, :email, :phone, :availability, :lang, :note, :rev)';
        }
    }

    $stmt = $db->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_FWDONLY));
    $stmt->execute($data);

    if (!array_key_exists('id', $data)) {
        $result = $db->query('SELECT last_insert_rowid()')->fetch();
        $data['id'] = $result['last_insert_rowid()'];
    }

    echo json_encode($data);
} else {
    header('HTTP/1.1 405 Method Not Allowed');
}
