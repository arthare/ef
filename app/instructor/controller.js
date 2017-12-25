import Ember from 'ember';
import apiPost from 'efitness/pojs/api-post';
import apiCall from 'efitness/pojs/api-call';

export default Ember.Controller.extend({

  isNewClassOpen: false,
  isNewLessonOpen: false,
  isNewLocationOpen: false,

  userService: Ember.inject.service('service-user'),
  dbService: Ember.inject.service('service-db'),

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
        const instructorId = this.get('userService.instructorId');
        return apiCall('instructorclass/' + instructorId, {}).then((classes) => {
          this.set('model.classes', classes);
        })
      }, (failure) => {
        alert("Failed to create new class: " + failure);
      })
    },

    newLesson(cls) {
      Ember.assert2(_.isObject(cls));
      Ember.assert2(_.isNumber(cls.id));
      Ember.assert2(_.isString(cls.name));

      this.set('newLessonClass', cls);
      this.set('isNewLessonOpen', true);
    },
    onDoneNewLesson(lesson) {
      console.log("they made a new lesson ", lesson);
      apiPost('newlesson', lesson).then(() => {
        this.set('isNewLessonOpen', false);
      }, (failure) => {
        alert("Failed to create new class: " + failure);
      });
    },
    newLocation(cls) {
      this.set('isNewLocationOpen', true);
    },
    onDoneNewLocation(loc) {
      apiPost('newlocation', loc).then(() => {
        this.set('isNewLocationOpen', false);
        console.log("new location done.  Time to call for the location list");
        // let's refresh the locations list
        this.get('dbService').refreshLists();

        return apiCall('locations', {}).then((locations) => {
          this.set('model.locations', locations);
        });
      }, (failure) => {
        alert("Failed to create new class: " + failure);
      });

    },

    onPickLocation(loc) {
      // we don't actually support _doing_ anything at this point...
    }
  }
});
