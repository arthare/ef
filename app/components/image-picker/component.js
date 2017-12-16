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
        this.set('image', e.target.result);
        this.set('hasImage', true);
        Ember.run.later(() => {
          const div = this.$('.image-picker__picked');
          div.css('background-image', `url(${e.target.result})`);

          this.attrs.onPick(e.target.result);
        });
      };
    })(f);

    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
  }
}

export default Ember.Component.extend({

  hasImage: false,

  didInsertElement() {
    Ember.assert2(_.isFunction(this.attrs.onPick));

    const files = document.getElementById('files').addEventListener('change', handleFileSelect.bind(this), false);
  },

  actions: {
    onPickImage() {
      // gotta open the browser dialog to pick an image
      this.$('.image-picker__filebutton').trigger('click');
    }
  }
});
