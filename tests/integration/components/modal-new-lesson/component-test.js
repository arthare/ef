import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('modal-new-lesson', 'Integration | Component | modal new lesson', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{modal-new-lesson}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#modal-new-lesson}}
      template block text
    {{/modal-new-lesson}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
