import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['round-button__container'],
  classNameBindings: ['working'],

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
