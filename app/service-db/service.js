import Ember from 'ember';
import apiCall from 'efitness/pojs/api-call';
export default Ember.Service.extend({

  loadPromise: null,

  instructors: [],
  locations: [],

  initInstance: function() {
    return this.refreshLists();
  },

  refreshLists() {
    const instructors = apiCall('instructors', {}).then((instructors) => {
      this.set('instructors', instructors);
    });
    const locations = apiCall('locations', {}).then((locations) => {
      this.set('locations', locations);
    });

    const promise = Ember.RSVP.all([instructors, locations]);
    this.set('loadPromise', promise);
    return promise;
  }
});
