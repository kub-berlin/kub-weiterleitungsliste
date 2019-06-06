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
        categories TEXT,
        address TEXT,
        openinghours TEXT,
        contact TEXT,
        lang TEXT,
        note TEXT,
        rev TEXT
    );');

    return $db;
}

$db = get_database();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $result = $db->query('SELECT * from entries')->fetchAll();
    foreach ($result as $i => $row) {
        $result[$i]['categories'] = json_decode($row['categories'], true);
    }

    if (isset($_GET['format']) && $_GET['format'] === 'csv') {
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

    if (!array_key_exists('name', $data)) {
        $sql = 'DELETE from entries WHERE id=:id';
    } else {
        $data['categories'] = json_encode($data['categories']);
        $data['mtime'] = time();
        if (array_key_exists('id', $data)) {
            $sql = 'UPDATE entries SET
                name=:name,
                mtime=:mtime,
                categories=:categories,
                address=:address,
                openinghours=:openinghours,
                contact=:contact,
                lang=:lang,
                note=:note,
                rev=:rev
                WHERE id=:id';
        } else {
            $sql = 'INSERT INTO entries
                (name, mtime, categories, address, openinghours, contact, lang, note, rev)
                VALUES
                (:name, :mtime, :categories, :address, :openinghours, :contact, :lang, :note, :rev)';
        }
    }

    $stmt = $db->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_FWDONLY));
    $stmt->execute($data);

    if (!array_key_exists('id', $data)) {
        $data['id'] = $db->lastInsertId();
    }

    echo json_encode($data);
} else {
    header('HTTP/1.1 405 Method Not Allowed');
}
