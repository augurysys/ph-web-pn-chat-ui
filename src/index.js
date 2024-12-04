import('./app/App');
// need to put react-mf url on the window object, so it could be dynamic to match each environment
// "window['mfURLs'].REACT_MF" is replaced by webpack DefinePlugin with the REACT_MF variable defined in the env file
if (!Boolean(window.platform)) {
  window.platform = {};
  window.platform.mfURLs = window['mfURLs'];
  window.platform.keys = window['keys'];
  window.platform.servicesUrls = window['servicesUrls'];
  window.platform.__GLOBALS = window['__GLOBALS'];
}
