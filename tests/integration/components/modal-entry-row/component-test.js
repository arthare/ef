import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('modal-entry-row', 'Integration | Component | modal entry row', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{modal-entry-row}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#modal-entry-row}}
      template block text
    {{/modal-entry-row}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
