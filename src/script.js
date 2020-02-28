"use strict";
if (navigator.geolocation) {
  var Options = {
    enableHighAccuracy: true,
    timeout: 1000,
    maximumAge: 0
  };

  function success(pos) {
    init(pos.coords.latitude, pos.coords.longitude);
    let maps = document.querySelectorAll("#map .ymaps-2-1-75-map");
    maps[0].remove();
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  navigator.geolocation.getCurrentPosition(success, error, Options);
}

ymaps.ready(init);
function init(latitude, longitude) {
  var placeMark1, coordsBegin, coordsEnd; //маркеры
  var myMap = new ymaps.Map("map", {
    center: [latitude, longitude],
    zoom: 16
  });
  
  var suggestView1 = new ymaps.SuggestView('suggest1');


  myMap.events.add("click", function(e) {
    if (coordsBegin === undefined) {
      placeMark1 = new ymaps.Placemark(e.get("coords"), {
        balloonContent: "Начало"
      });
      myMap.geoObjects.add(placeMark1);
      coordsBegin = e.get("coords");
    } else {
      if (coordsEnd === undefined) {
        coordsEnd = e.get("coords");
      }
      ymaps
        .route(
          [
            { type: "wayPoint", point: coordsBegin },
            { type: "wayPoint", point: coordsEnd }
          ],
          {
            multiRoute: false
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
}
