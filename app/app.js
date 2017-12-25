import Ember from 'ember';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import _ from 'lodash';
let App;

window._ = _;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver
});

window.efitness = {};
//window.efitness.baseUrl = 'http://45.33.76.113:3000';
window.efitness.baseUrl = 'http://artnew:3000';

Ember.assert2 = function(f) {
  if(!f) {
    debugger;
  }
}

loadInitializers(App, config.modulePrefix);

export default App;
