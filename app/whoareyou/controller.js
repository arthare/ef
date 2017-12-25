import Ember from 'ember';

export default Ember.Controller.extend({

  userService: Ember.inject.service('service-user'),
  

  actions: {
    selectUser(user) {
      const userService = this.get('userService');

      userService.setUser(user.id);
      userService.handleBounce('', this.transitionToRoute.bind(this));
    },
    selectInstructor(instructor) {
      const userService = this.get('userService');

      userService.setInstructor(instructor.id);
      userService.handleBounce('', this.transitionToRoute.bind(this));
    }
  }
});
