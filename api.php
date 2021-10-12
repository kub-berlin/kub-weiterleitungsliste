<?php declare(strict_types=1);

// ini_set('display_errors', 'On');

function get_database()
{
    $db = new PDO('sqlite:db.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, false);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $db->query('CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY,
        name TEXT,
        mtime INTEGER,
        category1 TEXT,
        subcategory1 TEXT,
        category2 TEXT,
        subcategory2 TEXT,
        category3 TEXT,
        subcategory3 TEXT,
        category4 TEXT,
        subcategory4 TEXT,
        category5 TEXT,
        subcategory5 TEXT,
        address TEXT,
        openinghours TEXT,
        contact TEXT,
        lang TEXT,
        note TEXT,
        map TEXT,
        rev TEXT
    );');

    return $db;
}

$db = get_database();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
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

    if (!array_key_exists('name', $data)) {
        $sql = 'DELETE from entries WHERE id=:id';
    } else {
        $data['mtime'] = time();
        if (array_key_exists('id', $data)) {
            $sql = 'UPDATE entries SET
                name=:name,
                mtime=:mtime,
                category1=:category1,
                subcategory1=:subcategory1,
                category2=:category2,
                subcategory2=:subcategory2,
                category3=:category3,
                subcategory3=:subcategory3,
                category4=:category4,
                subcategory4=:subcategory4,
                category5=:category5,
                subcategory5=:subcategory5,
                address=:address,
                openinghours=:openinghours,
                contact=:contact,
                lang=:lang,
                note=:note,
                map=:map,
                rev=:rev
                WHERE id=:id';
        } else {
            $sql = 'INSERT INTO entries
                (name, mtime, category1, subcategory1, category2, subcategory2, 
                category3, subcategory3, category4, subcategory4, category5, 
                subcategory5, address, openinghours, contact, lang, note, map, rev)
                VALUES
                (:name, :mtime, :category1, :subcategory1, :category2, :subcategory2, 
                :category3, :subcategory3, :category4, :subcategory4, :category5, 
                :subcategory5, :address, :openinghours, :contact, :lang, :note, :map, :rev)';
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
