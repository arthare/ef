import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('instructor');
  this.route('whatsup');
  this.route('whoareyou');
  this.route('pastclasses');
});

export default Router;
