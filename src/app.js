'use strict';
//import './style.css';

window.onload = initApp;

function initApp() {
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
  class InfoOrder extends HTMLElement {
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
  class ButtonOrder extends HTMLElement {
    constructor() {
      super();
    }
    render() {
      let boolPreview = this.getAttribute('preview') === 'true'
      if (boolPreview) {
        this.innerHTML =
          `<div class ='content-info-item-btns'> <button class='content-info-item-btn content-info-item-btn-order'>Закзать</button>` +
          `<button class='content-info-item-btn content-info-item-btn-cancel'>Отмена</button>` +
          `</div> `;
      } else {
        this.innerHTML =
          `<div class ='content-info-item-btns'>` +
          `<button class='content-info-item-btn content-info-item-btn-cancel'>Отмена</button>` +
          `</div> `;
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
  customElements.define('preview-order', PreviewOrder);
  customElements.define('info-order', InfoOrder);
  customElements.define('button-order', ButtonOrder);

  if (navigator.geolocation) {
    var OptionsLocation = {
      enableHighAccuracy: true,
      timeout: 500,
      maximumAge: 0
    };

    var locationLoad = pos => {
      initMap(pos.coords.latitude, pos.coords.longitude);
      document.querySelectorAll('div#map ymaps')[0].remove();
    };

    var errorLocationLoad = err => {
      console.warn(`ERROR (${err.code}): ${err.message}`);
    };
    //Поиск местоположения пользователя
    navigator.geolocation.getCurrentPosition(locationLoad, errorLocationLoad, OptionsLocation);
  }

  var initMap = (latitudeArg, longitudeArg) => {
    var latitude = latitudeArg;
    var longitude = longitudeArg;
    var placeMark1, routeBegin, routeEnd, mapRoute, mapRouteInfo, priceOrder, typeCar, carPlaceMark;

    var drivers = [{
        driverName: 'Игорь',
        driverCar: 'Wolksvagen Polo',
        driverCarColor: 'Красный',
        driverCarNumberplate: '12ru В228ИД',
        driverPhone: '+79872115577'
      },
      {
        driverName: 'Сергей',
        driverCar: 'Hyundai Solaris',
        driverCarColor: 'Серый',
        driverCarNumberplate: '21rus Б109ИС',
        driverPhone: '+79348714555'
      },
      {
        driverName: 'Андрей',
        driverCar: 'Toyota Camry',
        driverCarColor: 'Черный',
        driverCarNumberplate: '12rus С447ИД',
        driverPhone: '+79371177384'
      },
      {
        driverName: 'Константин',
        driverCar: 'Skoda Octavia',
        driverCarColor: 'Белая',
        driverCarNumberplate: '12rus Б991ЭМ',
        driverPhone: '+79841455281'
      },
      {
        driverName: 'Данил',
        driverCar: 'Lada Granta',
        driverCarColor: 'Серая',
        driverCarNumberplate: '12rus П321СТ',
        driverPhone: '+79993315690'
      }
    ];
    if (myMap !== undefined) myMap.destroy();

    var myMap = new ymaps.Map('map', {
      center: [latitude, longitude],
      zoom: 16
    });

    //Эта функция для узнавание информации о адресе
    async function geocodeRequest(point) {
      var myGeocoder = await ymaps.geocode(point, { result: 1 });
      return myGeocoder.geoObjects.get(0).properties.getAll();
    }

    //Создание маршрута
    async function createRoute() {
      mapRoute = ymaps.route(
        [
          { type: 'viaPoint', point: routeBegin },
          { type: 'viaPoint', point: routeEnd }
        ], {
          multiRoute: false
        }
      );
      mapRoute.done(
        function(route) {
          route.options.set('mapStateAutoApply', true);
          myMap.geoObjects.add(route);
        },
        function(err) {
          throw err;
        },
        this
      );
      return await mapRoute;
    }
    let select = document.querySelector('select#select_car')
    select.onchange = function() {
      previewOrder();
    };

    function createPriceOrder(routeInfo) {
      let selectCar = document.querySelector('select#select_car');
      if (selectCar.value === '0') typeCar = { title: 'Эконом', priceRatio: 1 };
      if (selectCar.value === '1') typeCar = { title: 'Комфорт', priceRatio: 1.5 };
      if (selectCar.value === '2') typeCar = { title: 'Детский', priceRatio: 1.35 };
      return typeCar.priceRatio * 60 + Math.round(routeInfo) * 10;
    }

    function startOrder() {
      if (document.querySelectorAll('.content-info-order-info').length === 0) {
        document.querySelector('button-order').setAttribute('preview', 'false');
        document.querySelector('.content-info-item-btn-cancel').onclick = cancelOrder;
        let indexDriver = Math.round(0 - 0.5 + Math.random() * drivers.length);
        let driver = drivers[indexDriver];

        let infoOrderSelector = document.createElement('info-order');
        infoOrderSelector.setAttribute('name', driver.driverName);
        infoOrderSelector.setAttribute('color', driver.driverCarColor);
        infoOrderSelector.setAttribute('car', driver.driverCar);
        infoOrderSelector.setAttribute('numberplate', driver.driverCarNumberplate);
        infoOrderSelector.setAttribute('phone', driver.driverPhone);

        document.querySelector('.content-info-item:last-child').appendChild(infoOrderSelector);
        carPlaceMark = new ymaps.Placemark(routeBegin, {
          balloonContent: 'Это красивая метка'
        }, {
          iconLayout: 'default#image',
          iconImageHref: 'image/taxi_icon.png',
          iconImageSize: [30, 30],
        });
        myMap.geoObjects.add(carPlaceMark);
      }
    }

    function cancelOrder() {
      if (mapRoute !== undefined) {
        myMap.destroy();
        document.querySelector('preview-order').remove();
        if (document.querySelector('info-order') !== null) document.querySelector('info-order').remove();
        updateInput('', false);
        updateInput('', true);
        initMap(latitude, longitude);
      }
    }

    function previewOrder() {
      if (routeBegin !== undefined && routeEnd !== undefined && mapRouteInfo !== undefined) {
        if (document.querySelectorAll('info-order').length === 0) {
          let previewOrderSelector;
          priceOrder = createPriceOrder(mapRouteInfo.length / 1000);
          if (document.querySelectorAll('preview-order').length === 0) {
            let div = document.createElement('div');
            div.classList.add('content-info-item');
            div.classList.add('order');
            document.querySelector('.content-info').appendChild(div);

            previewOrderSelector = document.createElement('preview-order');
            document.querySelector('.content-info-item:last-child').appendChild(previewOrderSelector);
          } else {
            previewOrderSelector = document.querySelector('preview-order');
          }
          previewOrderSelector.setAttribute('lengthText', mapRouteInfo.Length.text);
          previewOrderSelector.setAttribute('time', mapRouteInfo.Time.text);
          previewOrderSelector.setAttribute('price', priceOrder);
          previewOrderSelector.setAttribute('typecar', typeCar.title);

          document.querySelector('.content-info-item-btn-order').onclick = startOrder;
          document.querySelector('.content-info-item-btn-cancel').onclick = cancelOrder;
        }
      }
    }

    //Добавление адресов в поля
    function updateInput(valueInput, updateFromInput) {
      if (typeof valueInput === 'string') {
        if (updateFromInput) {
          let input = document.querySelector('input#from');
          input.value = valueInput;
        } else {
          let input = document.querySelector('input#to');
          input.value = valueInput;
        }
      }
    }

    //Подсказки адресов для полей(input)
    var suggestView1 = new ymaps.SuggestView('from');
    var suggestView2 = new ymaps.SuggestView('to');

    function setAddress(beginRoute, addressValue, clicked) {
      if (mapRoute === undefined) {
        if (routeBegin === undefined && beginRoute) {
          routeBegin = addressValue;
          if (clicked) {
            geocodeRequest(addressValue).then(function(result) {
              updateInput(result.text, true);
            });
          }
        }
        if (!beginRoute && routeEnd === undefined) {
          routeEnd = addressValue;
          if (clicked) {
            geocodeRequest(addressValue).then(function(result) {
              updateInput(result.text, false);
            });
          }
        }
        if (routeEnd !== undefined && routeBegin !== undefined) {
          createRoute().then(routeInfo => {
            mapRouteInfo = routeInfo.properties._data.RouterRouteMetaData;
            previewOrder();
          });
        }

      }
    }
    suggestView1.events.add('select', e => {
      setAddress(true, e.originalEvent.item.value, false);
    });
    suggestView2.events.add('select', e => {
      setAddress(false, e.originalEvent.item.value, false);
    });

    myMap.events.add('click', function(e) {
      if (placeMark1 === undefined && routeBegin === undefined) {
        placeMark1 = new ymaps.Placemark(e.get('coords'), {
          balloonContent: 'Начало маршрута'
        });
        myMap.geoObjects.add(placeMark1);
        setAddress(true, e.get('coords'), true);
      } else {
        setAddress(false, e.get('coords'), true);
      }
    });
  };

  ymaps.ready(initMap);
}