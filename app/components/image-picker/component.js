import Ember from 'ember';

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object
  // Loop through the FileList and render image files as thumbnails.
  for (var i = 0, f; f = files[i]; i++) {

    // Only process image files.
    if (!f.type.match('image.*')) {
      continue;
    }

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = ((theFile) => {
      return (e) => {
        // Render thumbnail.
        this.setImage(e.target.result);
      };
    })(f);

    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
  }
}

function resizeImage(original) {

  return new Ember.RSVP.Promise((resolve) => {
    var img = new Image;
    img.onload = function() {
      const aspect = img.width / img.height;
      const desiredHeight = 480;
      const desiredWidth = desiredHeight * aspect;
  
      var canvas = document.createElement('canvas');
      canvas.width = desiredWidth;
      canvas.height = desiredHeight;
      canvas.style.width = desiredWidth + 'px';
      canvas.style.height = desiredHeight + 'px';
      canvas.style.position = 'fixed';
      canvas.style.left = -10000;
      canvas.style.top = 0;
      canvas.style.zIndex = '10000';
      canvas.style.border = "1px solid black";
      document.body.appendChild(canvas);
  
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, desiredWidth, desiredHeight);
  
      var newDataUri = canvas.toDataURL('image/jpeg', 0.75);
      document.body.removeChild(canvas);
      resolve(newDataUri);
    }
    img.src = original;
  })


}

export default Ember.Component.extend({

  hasImage: false,

  didInsertElement() {
    Ember.assert2(_.isFunction(this.attrs.onPick));

    const files = this.$('#files').get(0);
    files.addEventListener('change', handleFileSelect.bind(this), false);

    const initial = this.get('initialPick');
    if(initial && initial.length > 0) {
      this.setImage(initial);
    }
  },

  setImage(value) {
    this.set('hasImage', true);
    Ember.run.later(() => {
      const div = this.$('.image-picker__picked');
      div.css('background-image', `url(${value})`);

      // value is going to be a data uri.  It'll actually be a string
      console.log("Image size is ", value.length);
      if(value.length > 500000) {
        resizeImage(value).then((resizedDataUri) => {
          this.set('image', resizedDataUri);
          console.log("resized image uri is ", resizedDataUri.length);
          this.attrs.onPick(resizedDataUri);
        });
      } else {
        this.set('image', value);
        this.attrs.onPick(value);
      }
    });
  },

  actions: {
    onPickImage() {
      // gotta open the browser dialog to pick an image
      this.$('.image-picker__filebutton').trigger('click');
    }
  }
});
