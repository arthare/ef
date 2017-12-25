import Ember from 'ember';
import apiCall from 'efitness/pojs/api-call';


export default Ember.Route.extend({

  userService: Ember.inject.service('service-user'),
  
    beforeModel() {
      this.get('userService').handleBounce('regular', this.transitionTo.bind(this));
    },
  
    model() {
      let ret = {};
      return apiCall('pastclasses', {userid: this.get('userService.userId')}).then((classes) => {
        console.log("Ret from pastclasses: ", classes);
        return {
          classes: classes,
        }
      });
    }
});
