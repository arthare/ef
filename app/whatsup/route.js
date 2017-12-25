import Ember from 'ember';
import apiCall from 'efitness/pojs/api-call';

export default Ember.Route.extend({

  userService: Ember.inject.service('service-user'),

  beforeModel() {
    this.get('userService').handleBounce('regular', this.transitionTo.bind(this));
  },

  model() {
    let ret = {};
    return apiCall('classschedule/0/1', {userid: this.get('userService.userId')}).then((todayClasses) => {
      ret.todayClasses = todayClasses;

      return apiCall('classschedule/1/30', {userid: this.get('userService.userId')});
    }).then((laterClasses) => {
      ret.laterClasses = laterClasses;

      return ret;
    });
  }
});
