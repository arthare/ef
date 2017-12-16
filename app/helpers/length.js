import Ember from 'ember';

export function length(params/*, hash*/) {
  Ember.assert2(_.isNumber(params[0]));
  let totalSeconds = params[0];
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds -= hours * 3600;
  const minutes = Math.floor(totalSeconds / 60);
  totalSeconds -= minutes * 60;
  const seconds = totalSeconds;

  let ret = '';
  if(hours > 0 ) {
    ret += hours + 'h';
  }
  if(minutes > 0) {
    ret += minutes + 'm';
  }
  if(seconds > 0) {
    ret += seconds + 's';
  }
  return ret;
}

export default Ember.Helper.helper(length);
