import Ember from 'ember';
import loadImgPromise from 'efitness/pojs/loadImgPromise';

export default Ember.Component.extend({

  classNames: ['pickable__container'],

  didInsertElement() {
    Ember.assert2(_.isString(this.get('type')));
    Ember.assert2(_.isNumber(this.get('item.id')));
    Ember.assert2(_.isString(this.get('item.name')));
    Ember.assert2(_.isFunction(this.attrs.onPick));
    
    // load the image, then assign it to the image
    const url = window.efitness.baseUrl + `/image/${this.get('type')}/${this.get('item.id')}`;
    loadImgPromise(url).then((image) => {
      // image is cached.  Let's apply it
      let img = this.$('.pickable__image');
      img.css('background-image', `url('${url}')`);
    })
  },

  actions: {
    onPicked() {
      this.attrs.onPick(this.get('item'));
    }
  }
});
