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

Here are some things that might be interesting:

-   The general idea is: Whenever an event happens, an event listener is called
    with the event object and the current *state*. It returns a new *state*
    that is automatically passed to a template function to re-render the
    complete app.
-   There are no HTML templates. Instead, we use a library called
    [virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript).
    All the template code is in `static/src/template.js`.
-   Example of how to add a new database column: cbc8b550
