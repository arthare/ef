import Ember from 'ember';
import apiCall from 'efitness/pojs/api-call';

export default Ember.Component.extend({

  classNames: ['expandable__container'],
  hasData: false,
  isExpanded: false,


  didInsertElement() {
    Ember.assert2(_.isObject(this.get('class')));
    Ember.assert2(_.isString(this.get('class.name')));
    console.log("class = ", this.get('class'));
    // let's get our image
    let img = this.$('.expandable__image');
    img.css('background-image', `url('http://localhost:3000/image/class/${this.get('class.id')}')`);
  },

  actions: {
    expandClass() {
      this.toggleProperty('isExpanded');
      this.set('hasData', false); // initially, we don't have data

      apiCall('classinstance/' + this.get('class.id'), {}).then((instances) => {
        this.set('instances', instances);

        console.log("instances = ", instances);
        this.set('hasData', true);
      })
    },
    newLesson() {
      // they want a new lesson
    }
  }
});
