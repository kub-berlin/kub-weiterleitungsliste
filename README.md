# Weiterleitungsliste

This is a glorified address book we use to manage the data of other places that
we might refer to.

The `sprachmittling` branch contains a modified version that is optimized for
translators instead.

# Installation

Just drop the `dist` folder on a server that supports PHP (with JSON and sqlite
support).

If you want to use a different database, edit the relevant parts in
`api.php`. If you want to change authentication (currently OIDC), edit
`auth.php`.
