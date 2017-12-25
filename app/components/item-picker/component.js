import Ember from 'ember';

export default Ember.Component.extend({

  isPicking: false,

  didInsertElement() {
    Ember.assert2(_.isArray(this.get('list')));
    Ember.assert2(_.isString(this.get('humanType')));
    Ember.assert2(_.isFunction(this.attrs.onPick));

    const initial = this.get('initialPick');
    if(initial) {
      this.set('pickedItem', initial);
    }
  },

  actions: {
    openPicker() {
      this.set('isPicking', true);
    },
    onPick(item) {
      this.set('isPicking', false);
      this.set('pickedItem', item);
      this.attrs.onPick(item);
    }
  }
});
