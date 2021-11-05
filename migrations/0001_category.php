<?php declare(strict_types=1);

$db = new PDO('sqlite:begleitung.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, false);
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

$db->beginTransaction();

try {
    $db->query('CREATE TABLE tmp (
        id INTEGER PRIMARY KEY,
        name TEXT,
        mtime INTEGER,
        categories TEXT,
        gender TEXT,
        email TEXT,
        phone TEXT,
        availability TEXT,
        lang TEXT,
        note TEXT,
        map TEXT,
        rev TEXT
    );');

    $data = $db->query('SELECT * from entries')->fetchAll();

    foreach ($data as $row) {
        $row['categories'] = json_encode(array(array($row['category'], $row['subcategory'])));
        unset($row['category']);
        unset($row['subcategory']);

        $sql = 'INSERT INTO tmp
            (id, name, mtime, categories, gender, email, phone, availability, lang, note, map, rev)
            VALUES
            (:id, :name, :mtime, :categories, :gender, :email, :phone, :availability, :lang, :note, :map, :rev)';
        $stmt = $db->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_FWDONLY));
        $stmt->execute($row);
    }

    $db->query('DROP TABLE entries');
    $db->query('ALTER TABLE tmp RENAME TO entries');

    $db->commit();
} catch (Exception $e) {
    $db->rollback();
    throw $e;
}
