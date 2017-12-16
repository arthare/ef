import Ember from 'ember';

export default Ember.Component.extend({
  
  didInsertElement() {
    Ember.assert2(_.isObject(this.get('instance')));
  }
});
