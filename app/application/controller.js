import Ember from 'ember';

export default Ember.Controller.extend({

  userService: Ember.inject.service('service-user'),

  userName: Ember.computed.readOnly('userService.userName'),

  userMoney: Ember.computed.readOnly('userService.userMoneyString'),
});
