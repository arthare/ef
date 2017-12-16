import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('expandable-class', 'Integration | Component | expandable class', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{expandable-class}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#expandable-class}}
      template block text
    {{/expandable-class}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
