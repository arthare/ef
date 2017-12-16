import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: ['isOpen:isOpen'],
  classNames: ['modal-dialog__container'],

  didInsertElement() {
    Ember.assert2(_.isBoolean(this.get('isOpen')));
    Ember.assert2(_.isString(this.get('title')));
  },

  actions: {
    cancelDialog() {
      this.set('isOpen', false);
    }
  }
  
});
