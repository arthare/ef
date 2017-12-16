import Ember from 'ember';
import apiCall from 'efitness/pojs/api-call';

export default Ember.Route.extend({


  model() {
    var ret = {};
    return apiCall('classes', {}).then((classes) => {
      ret.classes = classes;

      return ret;
    });
  }
});
