# installation

Just drop this folder on a server that supports PHP (with JSON and sqlite
support).

If you want to use a different database, just edit the relevant parts in
`api.php`.

# development

This repository contains pre-build static files. If you want to edit them, you
will need node.js. Then run `make` to set up the development environment.

Here are some things that might be interesting:

-   The general idea is: Whenever an event happens, an event listener is called
    with the event object and the current *state*. It returns a new *state*
    that is automatically passed to a template function to re-render the
    complete app.
-   There are no HTML templates. Instead, we use a library called
    [petit-dom](https://github.com/yelouafi/petit-dom).
    All the template code is in `static/src/template.js`.
-   Example of how to add a new database column:
    [cbc8b550](https://github.com/xi/kub-weiterleitungsliste/commit/cbc8b550e3c21a2127b68f0e3db1586a34b9e18c)
