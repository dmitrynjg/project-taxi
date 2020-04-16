'use strict';
import './style.css';
window.onload = initApp;

function initApp(){
  require('./webcomponents/button.js');
  require('./webcomponents/preview-order.js');
  require('./webcomponents/info-order.js');

 

  if (navigator.geolocation) {
    const optionsLocation = {
      enableHighAccuracy: true,
      timeout: 500,
      maximumAge: 0
    };

    const locationLoad = pos => {
      initMap(pos.coords.latitude, pos.coords.longitude);
      document.querySelectorAll('div#map ymaps')[0].remove();
    };

    const errorLocationLoad = err => {
      console.warn(`ERROR (${err.code}): ${err.message}`);
    };
    //Поиск местоположения пользователя
    navigator.geolocation.getCurrentPosition(locationLoad, errorLocationLoad, optionsLocation);
  }

  function initMap(latitudeArg, longitudeArg){
    var latitude = latitudeArg;
    var longitude = longitudeArg;
    var placeMark1, routeBegin, routeEnd, mapRoute, mapRouteInfo, priceOrder, carPlaceMark, typeCar;

    const drivers = require('./drivers.js');
    if (myMap !== undefined) myMap.destroy();

    var myMap = new ymaps.Map('map', {
      center: [latitude, longitude],
      zoom: 16
    });

    //Эта функция для узнавание информации о адресе
    async function geocodeRequest(point) {
      const geocoderResponse = await ymaps.geocode(point, { result: 1 });
      return geocoderResponse.geoObjects.get(0).properties.getAll();
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
      const typeCarInfo = require('./typecar.js');
      if (selectCar.value === '0') typeCar = typeCarInfo[0];
      if (selectCar.value === '1') typeCar = typeCarInfo[1];
      if (selectCar.value === '2') typeCar = typeCarInfo[2];
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
          balloonContent: 'Это метка такси'
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
