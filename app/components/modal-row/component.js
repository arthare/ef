import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['modal-new-class__row'],

  didInsertElement() {
    Ember.assert2(_.isString(this.get('label')));
  }
});
