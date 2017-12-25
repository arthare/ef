import Ember from 'ember';
import apiPost from 'efitness/pojs/api-post';

export default Ember.Controller.extend({

  userService: Ember.inject.service('service-user'),

  classes: Ember.computed.readOnly('model.classes'),

  ratedClasses: Ember.computed('classes', function() {
    console.log("my classes", this.get('classes'));

    return _.filter(this.get('classes'), (cls) => {
      Ember.assert2(_.isObject(cls.instance));

      return _.isNumber(cls.instance.rating);
    });
  }),

  unratedClasses: Ember.computed('classes', function() {
    console.log("classes in unrated ", this.get('classes'));

    return _.filter(this.get('classes'), (cls) => {
      Ember.assert2(_.isObject(cls.instance));
      return cls.instance.rating === null;
    });
  }),

  actions: {
    onRateClass(instance, rating) {
      Ember.assert2(_.isObject(instance));
      Ember.assert2(_.isNumber(rating) || rating === null);

      apiPost('rateclass', {id: instance.id, rating: rating, userid: this.get('userService.userId')}).then((rateResponse) => {
        // rating complete!
        console.log("class rated!");
      })
    }
  }
});
