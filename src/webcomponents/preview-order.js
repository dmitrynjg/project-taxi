'use strict';
class PreviewOrder extends HTMLElement {
  constructor() {
    super();
  }
  render() {
    this.innerHTML =
      `<div class='content-info-preview-order'>` +
      `<h3>О маршруте</h3>` +
      `<div class='content-info-preview-order-item'>Цена: ` +
      `<b>${this.getAttribute('price')}</b> &#8381; ${this.getAttribute('typecar')}</div>` +
      `<div class ='content-info-preview-order-item'>Расстояние: <b>${this.getAttribute('lengthText')}</b></div>` +
      `<div class ='content-info-preview-order-item'>Примерное время поездки: <b>${this.getAttribute('time')}</b></div>` +
      `<button-order preview = "true"></button-order>` +
      `</div>`;
  }
  connectedCallback() {
    this.render();
  }
  static get observedAttributes() {
    return ['price', 'lengthText', 'time', 'typecar'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // вызывается при изменении одного из перечисленных выше атрибутов
    this.render();
  }
}
module.exports = customElements.define('preview-order', PreviewOrder);