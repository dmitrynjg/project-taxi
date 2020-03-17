'use strict';

if (navigator.geolocation) {
  var OptionsLocation = {
    enableHighAccuracy: true,
    timeout: 500,
    maximumAge: 0
  };

  var locationLoad = pos => {
    initMap(pos.coords.latitude, pos.coords.longitude);
    let oldMap = document.querySelectorAll('.ymaps-2-1-75-map');
    oldMap[0].remove();
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
  var placeMark1, routeBegin, routeEnd, mapRoute, mapRouteInfo;
  var createRouteMap = false;
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
      ],
      {
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
  document.querySelector('select#select_car').onclick = function() {
    previewOrder();
  };

  function createPriceOrder(routeInfo) {
    let typeCar = document.querySelector('select#select_car');

    let priceRatio = 1;
    if (typeCar.value === '0') {
      priceRatio = 1;
    }
    if (typeCar.value === '1') {
      priceRatio = 1.5;
    }
    if (typeCar.value === '2') {
      priceRatio = 1.35;
    }

    return priceRatio * 60 + Math.round(routeInfo) * 10;
  }

  

  function previewOrder() {
    
    if (routeBegin !== undefined && routeEnd !== undefined && mapRouteInfo !== undefined) {
      if (document.querySelectorAll('.content-info-preview-order').length === 0) {
        let routeData = mapRouteInfo.properties._data.RouterRouteMetaData;
        let price = createPriceOrder(mapRouteInfo.getLength() / 1000);
        let div = document.createElement('div');
        div.classList.add('content-info-item');
        div.classList.add('content-info-preview-order');
        div.innerHTML =
          `<div class='content-info-item-price'>Цена: <span>${price}</span> &#8381;<div>` +
          `<div class ='content-info-item-route-length'>Расстояние: <span>${routeData.Length.text}</span></div>` +
          `<div class ='content-info-item-route-time'>Примерное время поездки: <span>${routeData.JamsTime.text}</span></div>` +
          `<div class ='content-info-item-btns'> <button class='content-info-item-btn content-info-item-btn-ok'>Закзать</button>` +
          `<button class='content-info-item-btn content-info-item-btn-cancel'>Отмена</button></div>`;
        document.querySelector('.content-info').appendChild(div);
        var btnCancel = document.querySelector('.content-info-item-btn-cancel');
        btnCancel.onclick = function() {
          console.log(true);
          if (mapRoute !== undefined) {
            myMap.destroy();
            document.querySelector('.content-info-preview-order').remove();
            updateInput('', false);
            updateInput('', true);
            initMap(latitude, longitude);
          }
        };
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
      if(routeEnd !== undefined && routeBegin !== undefined){
      createRoute().then(routeInfo => {
        mapRouteInfo = routeInfo;
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
