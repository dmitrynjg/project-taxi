"use strict";
//import './style.css';=
const apiKey = "3811dd5f-f8de-494b-8363-4c7bd519d44d";
var initMap = (latitude, longitude) => {
  var placeMark1, coordsBegin, coordsEnd; //маркеры
  var myMap = new ymaps.Map("map", {
    center: [latitude, longitude],
    zoom: 16,
  });

  var suggestView1 = new ymaps.SuggestView("from");
  var suggestView2 = new ymaps.SuggestView("to");

  function sendGeocoderRequest (method, request){
    let xhr = new XMLHttpRequest();
    let url = `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=${apiKey}&geocode=${request}`;
    xhr.open(method, url);
    xhr.onreadystatechange = function(){
      if (xhr.status === 200) {
        return xhr.responseText;
      }
    };
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();
    return xhr.onreadystatechange();
  };
  console.log(sendGeocoderRequest('GET',coordsBegin));
  myMap.events.add("click", function(e) {
    if (coordsBegin === undefined) {
      placeMark1 = new ymaps.Placemark(e.get("coords"), {
        balloonContent: "Начало",
      });
      myMap.geoObjects.add(placeMark1);
      coordsBegin = e.get("coords");
    } else {
      if (coordsEnd === undefined) {
        coordsEnd = e.get("coords");
      }
      
      //Создание маршрута
      ymaps
        .route(
          [
            { type: "wayPoint", point: coordsBegin },
            { type: "wayPoint", point: coordsEnd },
          ],
          {
            multiRoute: false,
          }
        )
        .done(
          function(route) {
            route.options.set("mapStateAutoApply", true);
            myMap.geoObjects.add(route);
            console.log(route.getLength());
          },
          function(err) {
            throw err;
          },
          this
        );
    }
  });
};
// Поиск местоположения
if (navigator.geolocation) {
  var Options = {
    enableHighAccuracy: true,
    timeout: 1000,
    maximumAge: 0,
  };

  var locationUserLoad = pos => {
    initMap(pos.coords.latitude, pos.coords.longitude);
    let oldMap = document.querySelectorAll(".ymaps-2-1-75-map");
    oldMap[0].remove();
  };

  var error = err => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  };
  navigator.geolocation.getCurrentPosition(locationUserLoad, error, Options);
}

ymaps.ready(initMap);
