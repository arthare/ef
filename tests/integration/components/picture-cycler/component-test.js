import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('picture-cycler', 'Integration | Component | picture cycler', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{picture-cycler}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#picture-cycler}}
      template block text
    {{/picture-cycler}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
