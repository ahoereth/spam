<?php


abstract class Route {

  protected static $app;

  protected static $db;

  protected static $method;

  protected static $params;

  protected static $user;


  public function __construct() {
    global $db, $app;

    self::$app = $app;
    self::$db  = $db;

    $request = self::$app->request();

    self::$method = $request->getMethod();
    self::$params = $request->params();

    if (empty(self::$params)) {
      self::$params = json_decode($request->getBody(), true);
    }
  }


  /**
   * GET
   * /_
   */
  abstract public function all_get();


  /**
   * POST
   * /_
   */
  abstract public function all_post();


  /**
   * GET
   * /_/:pk
   */
  abstract public function one_get($pk);


  /**
   * PUT
   * /_/:pk
   */
  abstract public function one_put($pk);


  /**
   * DELETE
   * /_/:pk
   */
  abstract public function one_delete($pk);


  /**
   * [args description]
   *
   * Example usage:
   *   explode(self::args(func_get_args(), array(
   *     'arg1',
   *     'arg2',
   *   )));
   *
   * @param  {array} $values result of func_get_args()
   * @param  {array} $keys   keys to intersect with the values
   * @return {assoc}         arguments in an associative array
   */
  protected static function args($values, $keys) {
    $result = array();

    $i = 0;
    foreach ($keys AS $key) {
      $result[ $key ] = ! empty($values[ $i ]) ? $values[ $i ] : null;
      $i++;
    }

    return $result;
  }


  /**
   * Route authorization.
   *
   * @param  {string} $myname        Only username allowed to access the route.
   * @param  {int}    $required_rank Minimum user rank for accessing the route.
   * @param  {bool}   $send          Send response instantly. Default: true.
   * @return {bool} Success/failure.
   */
  protected function authorize(
    $myname = null,
    $required_rank = null,
    $send = true
  ) {
    if (! self::$app->request()->headers('PHP_AUTH_USER') && $send) {
      self::not_authorized();
    } else {
      self::$user = User::authorize($myname, $required_rank);
      if (! self::$user && $send) {
        $error = json_encode(User::$authentication_errors);
        self::forbidden($error);
        return;
      }
    }

    return self::$user;
  }


  /**
   * Write the given data as JSON to the response and set the response
   * status to 200 OK.
   *
   * @param {array/assoc} $data
   */
  protected function ok($data) {
    $json = json_encode($data);

    self::$app->response->setStatus(200);
    //self::$app->response->setBody($json);
    self::$app->response->write($json);
  }


  /**
   * Set the response code to 204 NO CONTENT.
   */
  protected function no_content() {
    self::$app->response->setStatus(204);
  }


  /**
   * Stop the app with response code 400 BAD REQUEST.
   */
  protected function bad_request() {
    self::$app->stop(400);
  }


  /**
   * Halt the app and send the response code 401 NOT AUTHORIZED.
   *
   * @param {string} $message
   */
  protected function not_authorized($message = null) {
    //self::$app->response->setStatus(401);
    //self::$app->response->write($message);
    self::$app->halt(401, $message);
  }


  /**
   * Halt the app and send the response code 403 FORBIDDEN.
   *
   * @param {string} $message
   */
  protected function forbidden($message) {
    //self::$app->response->setStatus(401);
    //self::$app->response->write($message);
    self::$app->halt(403, $message);
  }


  /**
   * Set the response code to 401 NOT FOUND. App does not force quit, but it is
   * expected that no more code execution follows.
   */
  protected function not_found() {
    self::$app->response->setStatus(404);
  }


}
