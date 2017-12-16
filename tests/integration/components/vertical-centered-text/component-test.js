import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('vertical-centered-text', 'Integration | Component | vertical centered text', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{vertical-centered-text}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#vertical-centered-text}}
      template block text
    {{/vertical-centered-text}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
