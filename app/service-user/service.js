import Ember from 'ember';
import apiCall from  'efitness/pojs/api-call';

export default Ember.Service.extend({

  userId: -1,
  instructorId: -1,
  userType: '',

  userName: '',
  userMoneyString: '',
  userMoneyCents: 0,

  setUser(userid) {
    Ember.assert2(_.isNumber(userid));

    this.set('userId', userid);
    this.set('instructorId', -1);
    this.set('userType', 'regular');

    this.refreshUser();
  },
  setInstructor(instructorid) {
    Ember.assert2(_.isNumber(instructorid));


    this.set('userId', -1);    
    this.set('userName', '');    
    this.set('userMoneyString', '$0.00');    
    this.set('userMoneyCents', 0);    
    this.set('instructorId', instructorid);
    this.set('userType', 'instructor');
  },
  refreshUser() {
    apiCall('user/' + this.get('userId')).then((userData) => {
      Ember.assert2(_.isString(userData.moneystring));
      Ember.assert2(_.isNumber(userData.moneycents));

      this.set('userName', userData.name);
      this.set('userMoneyString', '$' + (userData.moneycents / 100).toFixed(2));
      this.set('userMoneyCents', userData.moneycents);
    });
  },
  handleBounce(permittedType, fnTransition) {

    if(this.get('userType') !== permittedType) {
      switch(this.get('userType')) {
        case 'regular':
          fnTransition('index');
          break;
        case 'instructor':
          console.log("Trying to go to instructor");
          fnTransition('instructor');
          break;
        default:
          fnTransition('whoareyou');
          break;
      }
    }
  }
});
