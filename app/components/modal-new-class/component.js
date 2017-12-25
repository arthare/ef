import Ember from 'ember';

export default Ember.Component.extend({

  dbService: Ember.inject.service('service-db'),

  classNames: ['.modal-new-class'],

  newClass: {
    name: '',
    instructorid: -1,
    locationid: -1,
    uniquetext: '',
    image: null,
    defaultprice: "5.00",
  },

  didInsertElement() {
    Ember.assert2(_.isBoolean(this.get("isOpen")));
    Ember.assert2(_.isFunction(this.attrs.onDone));
  },

  actions: {
    onPickLocation(location) {
      Ember.assert2(_.isNumber(location.id));
      this.set('newClass.locationid', location.id);
    },
    onPickInstructor(instructor) {
      Ember.assert2(_.isNumber(instructor.id));

      this.set('newClass.instructorid', instructor.id);
    },
    onPickedImage(image) {
      Ember.assert2(_.isString(image)); // expecting a base64-encoded image
      this.set('newClass.image', image);
    },
    submitNewClass() {
      console.log("Class = ", this.get('newClass'));

      const cls = this.get('newClass');
      if(!_.isString(cls.name) || cls.name.length < 3) {
        alert("Class needs a name");
        return;
      }
      if(!_.isNumber(cls.instructorid) || cls.instructorid < 0) {
        alert("Class needs an instructor");
        return;
      }
      if(!_.isNumber(cls.locationid) || cls.locationid < 0) {
        alert("Class needs a location");
        return;
      }
      if(!_.isString(cls.image)) {
        alert("Class needs an image");
        return;
      }
      this.attrs.onDone(cls);
    }
  }
});
