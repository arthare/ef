import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['schedule-instance__container'],

  didInsertElement() {
    Ember.assert2(_.isObject(this.get('instance')));
    console.log(this.get('instance'));

    // let's get to loading our image
    const image = this.$('.schedule-instance__image');
    const url = window.efitness.baseUrl + '/image/classinstance/' + this.get('instance.id');
    image.css('background-image', `url('${url}')`);
  },

  canChangeRating: Ember.computed(function() {
    return _.isFunction(this.attrs.onChangeRating);
  }),

  canChangeAttendance: Ember.computed(function() {
    return _.isFunction(this.attrs.onChangeAttendance);
  }),

  isAttending: Ember.computed.readOnly('instance.isattending'),

  actions: {
    attend() {
      this.set('isWorking', true);
      this.attrs.onChangeAttendance(this.get('instance'), true).finally(() => {
        this.set('isWorking', false);
      })
    },
    unattend() {
      this.set('isWorking', true);
      this.attrs.onChangeAttendance(this.get('instance'), false).finally(() => {
        this.set('isWorking', false);
      })
    },
    onRate(rating) {
      Ember.assert2(_.isNumber(rating) || rating === null);
      console.log("They want to rate ", this.get('instance.shortdesc'), " a ", rating);
      this.attrs.onChangeRating(this.get('instance'), rating);
    }
  }
});
