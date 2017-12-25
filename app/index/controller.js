import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    signUp() {

    },
    signIn() {

    },
    whatsUp() {
      this.transitionToRoute('whatsup');
    },
    pastClasses() {
      this.transitionToRoute('pastclasses');
    },
  }
});
