/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Inspection', function($http, User) {
  return {
    breeding_sites: [
      {"id":16,"description":"Barril"},
      {"id":2,"description":"Llanta"},
      {"id":1,"description":"Plato pequeño de maceta o florero"},
      {"id":14,"description":"Otros contenedores grandes utilizables (galones, piletas, otros depósitos de agua)"},
      {"id":13,"description":"Contenedores pequeños (de vidrio, jarrones, cubetas, tazones de agua, bolsas de plástico)"},
      {"id":7,"description":"Registros abiertos"},
      {"id":9,"description":"Piscinas"},
      {"id":10,"description":"Pozas de agua en la calle"},
      {"id":11,"description":"Drenajes"},
      {"id":8,"description":"Techo y terrazas con agua"},
      {"id":6,"description":"Cuneta"},
      {"id":3,"description":"Basura (recipientes inutilizados)"}
    ],
    create: function(inspection) {
      return $http({
        method: "POST",
        url:    denguechat.env.baseURL + "inspections/",
        data: {
          inspection: inspection
        },
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    },
    get: function(id) {
      return $http({
        method: "GET",
        url:    denguechat.env.baseURL + "visits/" + id,
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    }
  };
})
