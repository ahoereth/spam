<?php

// Get a valid username/password combination from the api with an GUI.
// Note: Password hashes are unique and change on every reload. Username hashes
// dont.
$app->get('/hash/:username/:password', function($username, $password) use ($app)
{
  $app->response->headers->set('Content-Type', 'text/html');
  $username = md5($username);
  $password = User::hasher($password); ?>

<title>SPAM API</title>
<p>
  <label>Hashed username:</label>
  <input
    type="text"
    value="<?php echo $username; ?>"
    onclick="select()"
    style="width: 80%;"
    readonly
  />
</p>
<p>
  <label>Crypted password:</label>
  <input
    type="text"
    value="<?php echo $password; ?>"
    onclick="select()"
    style="width: 80%;"
    readonly
  />
  <br />
</p>
<p>
  The hashed username is deterministic, the crypted password in contrast is not.
  Try reloading the page.
</p>

<?php
});
