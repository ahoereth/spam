import { indexOf, cloneDeep, assign } from 'lodash-es';


export default class NotificationsController {
  static $inject = ['$scope', 'httpIntercept'];

  static defaultState = {
    error: false,
    permanentError: false,
    status: 201,
    errors: [],
  };

  // TODO: split into instance methods and controller as style.
  constructor($scope, httpIntercept) {
    assign(this, {
      httpIntercept,
      http: cloneDeep(NotificationsController.defaultState),
    });

    /**
     * Listen to the http:error event and update the status appropriately.
     * Will result in a http error message being displayed to the user -
     * the server still retries!
     */
    $scope.$on('http:error', (event, response) => {
      this.http.error = true;
      this.http.status = response.status;

      if (indexOf(this.http.errors, response.config.url) === -1) {
        this.http.errors.push(response.config.url);
      }
    });


    /**
     * Listen to the http:error:resolved event and in result of this maybe hide
     * the http error notice (if all errors have been resolved.)
     */
    $scope.$on('http:error:resolved', (event, response) => {
      // remove the resolved error from the array
      const idx = indexOf(this.http.errors, response.config.url);
      if (idx === -1) {
        this.http.errors = this.http.errors.splice(idx, 1);
      }

      // are all errors resolved?
      if (!this.http.errors.length) {
        this.http.error = false;
        this.http.status = response.status;
      }
    });


    /**
     * Listen to the http:error:permanent event and update the error message appropriately.
     */
    $scope.$on('http:error:permanent', (event, response) => {
      this.http.error = true;
      this.http.permanentError = true;
      this.http.status = response.status;
    });
  }

  /**
   * Resets the http errors and closes the notice.
   */
  close() {
    this.httpIntercept.clear();
    this.http = cloneDeep(NotificationsController.defaultState);
  }
}
