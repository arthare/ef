import Ember from 'ember';

export default function(hitPage, data) {
  const url = window.efitness.baseUrl + '/' + hitPage;
  
  return new Ember.RSVP.Promise((resolve, reject) => {
    Ember.$.ajax(url, {
      data: data,
    }).done(resolve).fail(reject);
  });
}