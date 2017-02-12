import './style';
import './components/app';

/* global PRODUCTION, LIVERELOAD_PORT */
if (!PRODUCTION) {
  document.write(`<script src="http://localhost:${LIVERELOAD_PORT}/livereload.js"></script>`);
}
