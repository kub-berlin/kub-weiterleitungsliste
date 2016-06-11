# installation

Just drop this folder on a server that supports PHP (with JSON and sqlite
support).

If you want to use a different database, just edit the relevant parts in
`api.php`.

# development

This repository contains pre-build static files. If you want to edit them, you
will need node.js. Then run the following commands to set up the development
envorinment:

    $ cd static/src
    $ npm install
    $ npm run build-js
    $ npm run build-css
