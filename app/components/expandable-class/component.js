import Ember from 'ember';
import apiCall from 'efitness/pojs/api-call';

export default Ember.Component.extend({

  classNames: ['expandable__container'],
  hasData: false,
  isExpanded: false,
  userService: Ember.inject.service('service-user'),

  didInsertElement() {
    Ember.assert2(_.isObject(this.get('class')));
    Ember.assert2(_.isString(this.get('class.name')));
    // let's get our image
    let img = this.$('.expandable__image');
    const url = `url('${window.efitness.baseUrl}/image/class/${this.get('class.id')}')`;
    console.log("Trying to grab an image!", url, img);
    img.css('background-image', url);
  },

  actions: {
    expandClass() {
      this.toggleProperty('isExpanded');
      this.set('hasData', false); // initially, we don't have data

      apiCall('classinstances/' + this.get('class.id'), {userid: this.get('userService.userId')}).then((instances) => {
        this.set('instances', instances);

        console.log("instances = ", instances);
        this.set('hasData', true);
      })
    },
    newLesson() {
      // they want a new lesson
      this.attrs.onNewLesson(this.get('class'));
    }
  }
});
