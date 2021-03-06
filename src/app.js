// Vendor Modules
import $ from 'jquery';
import _ from 'underscore';

// CSS
import './css/foundation.css';
import './css/style.css';

import Trip from './app/models/trip';
import Reservation from './app/models/reservation';
import TripList from './app/collections/trip_list';

console.log('it loaded!');

const tripList = new TripList();
let tripTemplate;
let atripTemplate;
let trip;

const render = function render(tripList) {
  const $tripList = $('#trip-list');
  $tripList.empty();
  tripList.forEach((trip) => {
    $tripList.append(tripTemplate(trip.attributes));
  });
};

const seeTrip = function seeTrip(id){
  trip = tripList.get(id);
  trip.fetch({success: events.getTrip});
}

const updateStatusMessageWith = (message) => {
  $('#status-messages ul').empty();
  $('#status-messages ul').append(`<li>${message}</li>`);
  $('#status-messages').show();
}

const tripFields = ['name', 'continent', 'about', 'category', 'weeks', 'cost'];
const rezFields = ['name', 'age', 'email'];
const events = {
  showTrips() {
    $('#trips-table').toggle({'display': 'block'});
  },
  showNewForm() {
    $('#new-form').toggle({'display': 'block'});
  },
  getTrip(trip) {
  const $onetrip = $('.onetrip');
      $onetrip.empty();
      $onetrip.append(atripTemplate(trip.attributes));
  },
  makeReservation(event){
    event.preventDefault();
    const rezData = {};
    rezFields.forEach( (field) => {
      const val = $(`#rezform input[name=${field}]`).val();
      if (val != '') {
        rezData[field] = val;
      }
    });
    const reservation = new Reservation(rezData);

    if (reservation.isValid()) {
      const tripID = $(event.currentTarget.attributes.atripid).val();
      console.log(tripID)
      reservation.urlRoot = `${(new Trip()).urlRoot}${tripID}/reservations`;
      reservation.save({}, {
        success: events.successfullSave,
        error: events.failedSave,
      });
    } else {
      updateStatusMessageWith('reservation is invalid');
    }
  },
  successfullSave(reservation, response) {
    $('#rezform.input').val('');
    updateStatusMessageWith('reservation added!')
  },
  failedSave(reservation, response) {
    updateStatusMessageWith('reservation failed!');
    reservation.destroy();
  },
  addTrip(event) {
   event.preventDefault();
   const tripData = {};
   tripFields.forEach( (field) => {
     const val = $(`#newtrip input[name=${field}]`).val();
     if (val != '') {
       tripData[field] = val;
     }
   });
   const trip = new Trip(tripData);

   if (trip.isValid()) {

     trip.save({}, {
       success: events.successfullTripSave,
       error: events.failedTripSave,
     });
   } else {

     updateStatusMessageWith('Trip was invalid.');
   }

 },
 successfullTripSave(trip, response) {
   $('#newtrip.input').val('');
   updateStatusMessageWith('Trip added!')
 },
 failedTripSave(trip, response) {
   updateStatusMessageWith('Trip failed!');
   trip.destroy();
 },
 sortTrips(event) {
    $('.current-sort-field').removeClass('current-sort-field');
    $(this).addClass('current-sort-field');


    let classes = $(this).attr('class').split(/\s+/);

    classes.forEach((className) => {
      if (tripFields.includes(className)) {
        if (className === tripList.comparator) {
          tripList.models.reverse();
          tripList.trigger('sort', tripList);
        }
        else {
          tripList.comparator = className;
          tripList.sort();
        }
      }
    });
  },

};

$(document).ready( () => {
  tripTemplate = _.template($('#trip-template').html());
  atripTemplate = _.template($('#atrip-template').html());
  $('#load').on('click', function() {
      events.showTrips();
  });
  tripList.on('update', render, tripList);
  tripList.fetch();

  $('#trips-table').on('click', '.trip', function() {
    let tripID = $(this).attr('atrip-id');
    seeTrip(tripID);
  })
  $('#newtripform').on('click', function() {
      events.showNewForm();
  });

  $('.sort').click(events.sortTrips);
  tripList.on('sort', render, tripList);

  $('#newtrip').submit(events.addTrip);
  $(document).on('submit', '#rezform', events.makeReservation);
  // $('main').html('<h1>Hello World!</h1>');
});
