import Ember from 'ember';

export default Ember.Component.extend({

  didInsertElement() {
    Ember.assert2(_.isArray(this.get('classes')));
  }
});
