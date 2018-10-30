import Editor from './editor';

/**
 * Load Netlify CMS automatically if `window.EDITOR_MANUAL_INIT` is set.
 */
// if (!window.EDITOR_MANUAL_INIT) {
//   window.editor = new Editor;
// } else {
//   console.log('`window.EDITOR_MANUAL_INIT` flag set, skipping automatic initialization.');
// }

/**
 * Add extension hooks to global scope.
 */
// if (typeof window !== 'undefined') {
//   window.initEditor = Editor;
// }

export { Editor as default };