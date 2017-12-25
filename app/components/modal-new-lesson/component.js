import Ember from 'ember';

window.onChangeDateTime = function() {
  console.log("change date time?");
}

export default Ember.Component.extend({

  dbService: Ember.inject.service('service-db'),

  newLesson: {
    locationid: -1,
    instructorid: -1,
    classid: -1,
    shortdesc: '',
    longdesc: '',
    image: null,
    starttime: -1,
    lengthseconds: -1,
  },

  lengthMinutes: 60,
  onMinutesChange: Ember.observer('lengthMinutes', function() {
    let newValue = this.get('lengthMinutes');
    try {
      newValue = parseInt(newValue);
      this.set('newLesson.lengthseconds', newValue * 60);
    } catch(e) {
      console.log("e = ", e);
    }
  }).on('init'),

  didInsertElement() {
    Ember.assert2(_.isFunction(this.attrs.onDone));
    Ember.assert2(_.isBoolean(this.get('isOpen')));
    Ember.assert2(_.isObject(this.get('cls'))); // you need to supply us the classid that they picked
    Ember.assert2(_.isNumber(this.get('cls.defaultpricecents')));

    this.set('newLesson.classid', this.get('cls.id'));
    this.set('newLesson.price', (this.get('cls.defaultpricecents') / 100).toFixed(2));

    const datetime = this.$('input[type="datetime-local"]');
    console.log("dt = ", datetime);
    datetime.change((val) => {
      const dt = new Date(datetime.val());
      this.set('newLesson.starttime', dt.getTime() / 1000);
    });
  },
  dialogTitle: Ember.computed('cls', function() {
    return `New ${this.get('cls.name')} Lesson`;
  }),

  dateString: Ember.computed('newLesson.starttime', function() {
    const date = new Date(this.get('newLesson.starttime') * 1000);

    console.log("date.getHours = ", date.getHours());
    const hours = date.getHours() % 12;
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' @ ' + hours + ':' + date.getMinutes() + ampm;
  }),

  actions: {
    onSubmit() {
      console.log(this.get('newLesson'));
      this.set('confirming', true);
    },
    onPickLocation(loc) {
      this.set('newLesson.locationid', loc.id);
      this.set('pickedLocation', loc);
    },
    onPickInstructor(instr) {
      this.set('newLesson.instructorid', instr.id);
      this.set('pickedInstructor', instr);
    },
    onPickedImage(image) {
      this.set('newLesson.image', image);
    },

    onCancelConfirm() {
      this.set('confirming', false);
    },
    onConfirm() {
      // time to submit!
      this.attrs.onDone(this.get('newLesson'));
    }
  }
});
