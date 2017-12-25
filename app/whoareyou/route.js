import Ember from 'ember';
import apiCall from 'efitness/pojs/api-call';

export default Ember.Route.extend({

  model() {
    var ret = {};
    return apiCall('users', {}).then((users) => {
      ret.users = users;
      return apiCall('instructors', {});
    }).then((instructors) => {
      ret.instructors = instructors;

      return ret;
    });
  }
});
