import Ember from 'ember';
import apiCall from 'efitness/pojs/api-call';

export default Ember.Route.extend({

  userService: Ember.inject.service('service-user'),

  beforeModel() {
    this.get('userService').handleBounce('instructor', this.transitionTo.bind(this));
  },

  model() {
    const instructorId = this.get('userService.instructorId');
    const ret = {};
    return apiCall('instructorclass/' + instructorId, {}).then((result) => {

      ret.classes = result;
      return apiCall('instructor/' + instructorId);
    }).then((instructorData) => {
      ret.instructor = instructorData;

      return apiCall('locations', {});
    }).then((locations) => {
      ret.locations = locations;
      console.log("ret = ", ret);
      return ret;
    });
  }
});
