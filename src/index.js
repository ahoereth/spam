import './style';
import './components/app';

if (ENV !== 'production') {
  document.write(`<script src="http://${location.hostname}:35729/livereload.js?snipver=1"></script>`);
}
