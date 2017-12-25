import Ember from 'ember';
import apiCall from 'efitness/pojs/api-call';

export default Ember.Route.extend({

  userService: Ember.inject.service('service-user'),

  beforeModel() {
    this.get('userService').handleBounce('regular', this.transitionTo.bind(this));
  },

  model() {
    var ret = {};
    return apiCall('classes', {}).then((classes) => {

      classes.forEach((cls) => {
        Ember.assert2(_.isNumber(cls.id));
        Ember.assert2(_.isString(cls.name));
      })
      ret.classes = classes;

      return ret;
    });
  }
});
