import angular from 'angular';


function sortableDirective() {
  let draggedelement;
  let sourcemodel;

  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      options: '=htmlSortable',
      ngModel: '=',
    },
    link: function sortableLink(scope, element, attrs, ngModel) {
      if (!('draggable' in angular.element('<span>')[0])) {
        return;
      }

      const defaults = {
        active: true,
        allow_cross: false,
        handle: false,
        construct: (/* models */) => {},
        stop: (/* model, idx */) => {},
      };

      const sortable = {
        is_handle: false,
        in_use: false,
        options: angular.copy(defaults),
      };

      // Start dragging.
      sortable.handleDragStart = e => {
        draggedelement = null;
        sourcemodel = null;

        if (sortable.options.handle && !sortable.is_handle) {
          e.preventDefault();
          return;
        }

        sortable.is_handle = false;

        e.dataTransfer.effectAllowed = 'move';
        if (e.dataTransfer.setData) {
          e.dataTransfer.setData('text/plain', 'anything');
        }

        draggedelement = this;
        sourcemodel = ngModel;

        // this/e.target is the source node.
        this.classList.add('moving');
        this.parentElement.parentElement.classList.add('sortable-active');
      };


      // Dragging element over a dropzone - continuously.
      sortable.handleDragOver = e => {
        if (e.preventDefault) {
          e.preventDefault(); // Allows us to drop.
        }

        e.dataTransfer.dropEffect = 'move';
        if (!this.classList.contains('over')) {
          this.classList.add('over');
        }
      };


      // Dragging element over a dropzone - initial.
      sortable.handleDragEnter = () => {};


      // Dragging element out of a dropzone.
      sortable.handleDragLeave = () => {
        this.classList.remove('over');
      };


      // Dropping element into a dropzone.
      sortable.handleDrop = e => {
        // this/e.target is current target element.
        if (e.stopPropagation) { // Stop redirection.
          e.stopPropagation();
        }
        e.preventDefault();
        sortable.handleDragEnd();

        if (draggedelement === this || draggedelement == null) {
          return;
        }

        const draggedmodel = draggedelement.model;
        const dragIndex = ngModel.$modelValue.indexOf(draggedmodel);
        const dropIndex = !angular.isDefined(this.index) ?
                           ngModel.$modelValue.length : this.index;

        if (dragIndex !== -1) {
          // Move inside of one group.
          ngModel.$modelValue.splice(dragIndex, 1);
          ngModel.$modelValue.splice(dropIndex, 0, draggedmodel);
        } else if (sortable.options.allow_cross) {
          // Move into a new group.
          ngModel.$modelValue.splice(dropIndex, 0, draggedmodel);
          const idx = sourcemodel.$modelValue.indexOf(draggedmodel);
          if (idx !== -1) {
            sourcemodel.$modelValue.splice(idx, 1);
          }
        } else {
          // Not allowed to move to new group.
          return;
        }

        if (sortable.options && angular.isDefined(sortable.options.stop)) {
          sortable.options.stop(ngModel.$modelValue, dropIndex);
        }
      };


      // Dragging stopped, element dropped - whereever.
      sortable.handleDragEnd = () => {
        angular.forEach(sortable.cols, col => {
          col.classList.remove('over');
          col.classList.remove('moving');
          col.classList.remove('selected');
          col.parentElement.parentElement.classList.remove('sortable-active');
        });
      };


      // Fired when the specified handle is used for dragging.
      sortable.activehandle = () => {
        sortable.is_handle = true;
      };


      // Required because querySelector is not available during init.
      function bindHandleBinder() {
        this.removeEventListener('mouseover', bindHandleBinder, false);
        const handle = this.querySelector(sortable.options.handle);
        if (handle) {
          handle.addEventListener('mousedown', sortable.activehandle, false);
        }
      }


      // Unbind all events.
      sortable.unbind = () => {
        angular.forEach(sortable.cols, c => {
          c.removeAttribute('draggable');
          c.removeEventListener('dragstart', sortable.handleDragStart, false);
          c.removeEventListener('dragenter', sortable.handleDragEnter, false);
          c.removeEventListener('dragover', sortable.handleDragOver, false);
          c.removeEventListener('dragleave', sortable.handleDragLeave, false);
          c.removeEventListener('drop', sortable.handleDrop, false);
          c.removeEventListener('dragend', sortable.handleDragEnd, false);
          if (sortable.options.handle) {
            c.removeEventListener('mouseover', bindHandleBinder, false);
            c.querySelector(sortable.options.handle)
             .removeEventListener('mousedown', sortable.activehandle, false);
          }
        });
        sortable.in_use = false;
      };


      // Bind all events.
      sortable.bind_single = elem => {
        elem.addEventListener('drop', sortable.handleDrop, false);
        elem.addEventListener('dragstart', sortable.handleDragStart, false);
        elem.addEventListener('dragenter', sortable.handleDragEnter, false);
        elem.addEventListener('dragover', sortable.handleDragOver, false);
        elem.addEventListener('dragleave', sortable.handleDragLeave, false);
        elem.addEventListener('drop', sortable.handleDrop, false);
        elem.addEventListener('dragend', sortable.handleDragEnd, false);
        if (sortable.options.handle) {
          elem.addEventListener('mouseover', bindHandleBinder, false);
        }
      };


      // Update sortable. Fired for example when a new element is added or
      // removed from the model.
      sortable.update = () => {
        draggedelement = null;
        let index = 0;
        this.cols = element[0].children;

        // Create drop zone below all other elements if it does not exist yet.
        if (!element[0].querySelector('.dropzone')) {
          const placeholder = angular.element('<div class="dropzone"><br><br><br></div>')[0];
          element[0].appendChild(placeholder);
        }

        // Initialize listeners for each child.
        angular.forEach(this.cols, col => {
          col.index = index;
          col.model = ngModel.$modelValue[index];
          index++;
          sortable.bind_single(col);

          // One of the child elements might be the dropzone, ignore it.
          if (!col.classList.contains('dropzone')) {
            col.setAttribute('draggable', 'true');
          }
        });

        sortable.in_use = true;
      };


      // Watch sortable option for changes.
      scope.$watch('options', options => {
        sortable.options = angular.extend({}, defaults, options);

        if (sortable.options.active === false) {
          if (sortable.in_use) {
            sortable.unbind();
            sortable.in_use = false;
          }
          return;
        }

        if (angular.isFunction(sortable.options.construct)) {
          sortable.options.construct(ngModel.$modelValue);
        }

        element[0].classList.add('sortable');
        sortable.update();
      }, true);


      // Watch ngModel for changes in order to refresh the DOM listeners.
      scope.$watch('ngModel', (n, o) => {
        if (
          n === o || n.length === o.length ||
          sortable.options.active === false
        ) { return; }

        sortable.update();
      }, true);
    },
  };
}


/**
 * MODULE: sortable
 * DIRECTIVE: sortable
 *
 * HTML5 powered sortable.
 *
 * Initially forked from bachvtuan/html5-sortable-angularjs
 */
export default angular
  .module('sortable', [])
  .directive('htmlSortable', sortableDirective)
  .name;
