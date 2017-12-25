import Ember from 'ember';
import loadImgPromise from 'efitness/pojs/loadImgPromise';

export default Ember.Component.extend({

  classNames: ['cycler__container'],

  index: 0,

  didInsertElement() {
    Ember.assert2(_.isArray(this.get('classes')));

    this.cycleIn();
  },

  goodClasses: Ember.computed('classes', function() {
    return _.filter(this.get('classes'), (cls) => {
      return _.isNumber(cls.nexttime);
    });
  }),

  getNextClass() {
    let ix = this.get('index');
    const classes = this.get('goodClasses');
    const ret = classes[ix];

    ix++;
    if(ix >= classes.length) {
      ix = 0;
    }
    this.set('index', ix);

    return ret;
  },

  cycleIn() {
    const theClass = this.getNextClass();
    var locationImg = loadImgPromise(window.efitness.baseUrl + '/image/location/' + theClass.location.id);
    var instructorImg = loadImgPromise(window.efitness.baseUrl + '/image/instructor/' + theClass.instructor.id);
    var classImg = loadImgPromise(window.efitness.baseUrl + '/image/class/' + theClass.id);
    console.log("cycling in!");
    Ember.RSVP.all([locationImg, instructorImg, classImg]).then((allLoaded) => {
      // everything is loaded!  let's cycle out the old images, then put these in.
      const images = this.$('.cycler_image');
      console.log("images = ", images);
      Ember.run.later(() => {
        // ok, we're faded out.  Swap their images
        this.$('.cycler__location').css('background-image', `url('${allLoaded[0]}')`);
        this.$('.cycler__instructor').css('background-image', `url('${allLoaded[1]}')`);
        this.$('.cycler__class').css('background-image', `url('${allLoaded[2]}')`);
        console.log("images!");
        this.set('running', true);
        this.set('currentClass', theClass);

        Ember.run.later(() => {
          this.set('running', false);
          this.set('currentClass', null);
          this.cycleIn();
        }, 10000)

      }, 500);

    });
  },

});
