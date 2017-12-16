import Ember from 'ember';

export function price(params/*, hash*/) {
  const price = params[0];
  if(_.isNumber(params[0])) {
    return '$' + (price / 100).toFixed(2);
  }
  return "Unknown";
}

export default Ember.Helper.helper(price);
