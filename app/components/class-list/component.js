import Ember from 'ember';

export default Ember.Component.extend({

  didInsertElement() {
    Ember.assert2(_.isArray(this.get('classes')));
    Ember.assert2(_.isFunction(this.attrs.onNewLesson));
  },

  actions: {
    onNewLesson(cls) {
      this.attrs.onNewLesson(cls);
    }
  }
});
