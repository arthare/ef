import Ember from 'ember';
import apiPost from 'efitness/pojs/api-post';
import apiCall from 'efitness/pojs/api-call';

export default Ember.Controller.extend({

  userService: Ember.inject.service('service-user'),

  actions: {
    onChangeAttendance(instance, isAttending) {
      // someone wants to attend or unattend classinstance instance
      // needs to return a promise
      Ember.assert2(_.isObject(instance));
      Ember.assert2(_.isBoolean(isAttending));
      const userService = this.get('userService');

      return apiPost('changeattendance', {
        lessonid: instance.id,
        userid: userService.get('userId'),
        isattending: isAttending,
        rating: null,
      }).then((result) => {
        // fetch the new data for this class
        return apiCall('classinstance/' + instance.id, {userid: this.get('userService.userId')}).then((newInstance) => {
          console.log("newInstance = ", newInstance);
          for(var key in newInstance) {
            Ember.set(instance, key, newInstance[key]);
          }
          console.log("instance after update: ", instance);
        })
      });
    }
  }
});
