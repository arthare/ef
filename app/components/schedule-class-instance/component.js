import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['schedule-instance__container'],

  didInsertElement() {
    Ember.assert2(_.isObject(this.get('instance')));

    console.log(this.get('instance'));

    // let's get to loading our image
    const image = this.$('.schedule-instance__image');
    const url = window.efitness.baseUrl + '/image/classinstance/' + this.get('instance.id');
    image.css('background-image', `url('${url}')`);
  },
});
