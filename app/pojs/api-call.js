import Ember from 'ember';

export default function(hitPage, data) {
  const url = 'http://localhost:3000' + '/' + hitPage;
  
  return new Ember.RSVP.Promise((resolve, reject) => {
    Ember.$.ajax(url, {
      data: data,
    }).done(resolve).fail(reject);
  });
}