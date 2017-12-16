import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['round-button__container'],

  didInsertElement() {
    Ember.assert2(_.isFunction(this.attrs.onPress));
  },

  click() {
    this.send('onPress');
  },

  actions: {
    onPress() {
      this.attrs.onPress();
    }
  }
});
