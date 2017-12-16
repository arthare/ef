import Ember from 'ember';
import apiCall from 'efitness/pojs/api-call';

export default Ember.Route.extend({

  model(params) {
    const ret = {};
    return apiCall('instructorclass/' + params.id, {}).then((result) => {

      ret.classes = result;
      console.log("instructorclass = ", result);
      return apiCall('instructor/' + params.id);
    }).then((instructorData) => {
      ret.instructor = instructorData;

      console.log("ret = ", ret);
      return ret;
    });
  }
});
