import Ember from 'ember';

export default Ember.Component.extend({

  ratings: [1,2,3,4,5],

  classNames: ['rating-control__container'],

  rating: null,

  unrated: Ember.computed('rating', function() {
    return this.get('rating') === null;
  }),

  didInsertElement() {
    Ember.assert2(_.isFunction(this.attrs.onRate));
    Ember.assert2(_.isNumber(this.get('rating')) || this.get('rating') === null);
  },

  onChangeRating: Ember.observer('rating', function() {
    const stars = this.$('.rating-control__rate--container');
    let rating = this.get('rating');
    rating = rating === null ? 5 : rating; // make it look like a "null" rating is a 5-star

    // if they head up, move multiplicand up
    const pos = (5 - rating) * 24.625 + 1;
    stars.css('background-position-y', pos + '%');
  }),

  actions: {
    rate(rating) {
      Ember.assert2(_.isNumber(rating));
      Ember.assert2(rating >= 1 && rating <= 5);

      if(rating === this.get('rating')) {
        // they want to cancel their rating
        this.set('rating', null);
        this.attrs.onRate(null);
      } else {
        this.set('rating', rating);
        this.attrs.onRate(rating);
      }
    }
  }
});
