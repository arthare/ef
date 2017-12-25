import Ember from 'ember';

export default Ember.Component.extend({

  currentLat: 43.4414344,
  currentLon: -80.4975554,
  zoom: 10,

  newLocation: {
    image: null,
    name: '',
    description: '',
  },

  didInsertElement() {
    // let's figure out where we are (if possible).  If not, we'll just estimate kitchener
    Ember.assert2(_.isFunction(this.attrs.onDone));
  },

  locationChanged: Ember.observer('currentLat', 'currentLon', function() {
    console.log("Currently: ", this.get('currentLat'), this.get('currentLon'));
    this.set('newLocation.latdegrees', this.get('currentLat'));
    this.set('newLocation.londegrees', this.get('currentLon'));
  }),

  actions: {
    onPickedImage(image) {
      this.set('newLocation.image', image);
    },
    submitNewLocation() {
      const newLoc = this.get('newLocation');
      if(newLoc.name.length <= 3) {
        alert("You'll need a longer anme than that");
        return;
      }
      if(newLoc.description.length <= 3) {
        alert("You'll need a longer description than that");
        return;
      }
      if(!newLoc.image || newLoc.image.length <= 3) {
        alert("You need to include an image!");
        return;
      }
      if(!_.isNumber(newLoc.latdegrees)) {
        alert("You need to pick a location");
        return;
      }
      if(!_.isNumber(newLoc.londegrees)) {
        alert("You need to pick a location");
        return;
      }

      this.attrs.onDone(newLoc);
    }
  }
});
