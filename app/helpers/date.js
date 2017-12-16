import Ember from 'ember';

export function date(params/*, hash*/) {
  const unixMs = parseInt(params[0]) * 1000;
  return new Date(unixMs).toDateString();
}

export default Ember.Helper.helper(date);
