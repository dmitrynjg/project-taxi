'use strict';
class ButtonOrder extends HTMLElement {
  constructor() {
    super();
  }
  render() {
    if (this.getAttribute('preview') === 'true'){
      this.innerHTML =
        `<div class ='content-info-item-btns'> <button class='content-info-item-btn content-info-item-btn-order'>Закзать</button>` +
        `<button class='content-info-item-btn content-info-item-btn-cancel'>Отмена</button>` +
        `</div> `;
    } else {
      this.innerHTML =
        `<div class ='content-info-item-btns'>` +
        `<button class='content-info-item-btn content-info-item-btn-cancel'>Отмена</button>` +
        `</div>`;
    }
  }
  connectedCallback() {
    this.render();
  }
  static get observedAttributes() {
    return ['preview'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // вызывается при изменении одного из перечисленных выше атрибутов
    this.render();
  }
}
module.exports = customElements.define('button-order', ButtonOrder);