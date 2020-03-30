'use strict';
module.exports = class InfoOrder extends HTMLElement {
  constructor() {
    super();
  }
  render() {
    this.innerHTML =
      `<div class="content-info-order-info">` +
      `<h3>О водителе</h3>` +
      `<div class="content-info-order-driver-name"><span class="info-order-driver-icon user"></span>Имя: <b>${this.getAttribute('name')}</b></div>` +
      `<div class="content-info-order-car">` +
      `<div class="content-info-order-carInfo"><span class="info-order-driver-icon car"></span>Авто: <b>${this.getAttribute('color')} ${this.getAttribute('car')}</b></div>` +
      `<div class="content-info-order-carNumberplate"><span class="info-order-driver-icon numcar"></span>Номер авто: <b>${this.getAttribute('numberplate')}</b></div> </div>` +
      `<div class="content-info-order-car-driverPhone"><span class="info-order-driver-icon phone"></span>Номер телефона водителя: <b>${this.getAttribute('phone')}</b></div>` +
      `</div>`;
  }
  connectedCallback() {
    this.render();
  }
  static get observedAttributes() {
    return ['name', 'color', 'numberplate', 'car', 'phone'];
  }

}