export default function loadImgPromise(url) {
  var img = document.createElement('img');

  const ret = new Ember.RSVP.Promise((resolve, reject) => {
    img.onload = function() {
      document.querySelector('body').removeChild(img);
      resolve(url);
    };
    img.onerror = function() {
      document.querySelector('body').removeChild(img);
      reject(url);
    }
  })
  
  // trigger loading
  img.src = url;
  img.style.display = 'none';
  document.querySelector('body').appendChild(img);

  return ret;
}