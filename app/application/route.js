import Ember from 'ember';

export default Ember.Route.extend({
  dbService: Ember.inject.service('service-db'),

  beforeModel() {
    return this.get('dbService').initInstance();
  },
});
