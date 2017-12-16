import Ember from 'ember';
import apiPost from 'efitness/pojs/api-post';

export default Ember.Controller.extend({

  isNewClassOpen: false,

  classCount: Ember.computed('model.classes', function() {
    return this.get('model.classes.length');
  }),

  actions: {
    newClass() {
      this.set('isNewClassOpen', true);
    },
    onDoneNewClass(cls){
      this.set('isNewClassOpen', false);

      // time to submit to the server!
      apiPost('newclass', cls).then(() => {

      }, (failure) => {
        alert("Failed to create new class: " + failure);
      })
    }
  }
});
