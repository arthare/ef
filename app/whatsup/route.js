import Ember from 'ember';
import apiCall from 'efitness/pojs/api-call';

export default Ember.Route.extend({

  model() {
    let ret = {};
    return apiCall('classschedule/0/1', {}).then((todayClasses) => {
      ret.todayClasses = todayClasses;

      return apiCall('classschedule/1/30', {});
    }).then((laterClasses) => {
      ret.laterClasses = laterClasses;

      return ret;
    });
  }
});
