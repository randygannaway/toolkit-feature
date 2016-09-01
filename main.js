/* eslint-disable no-unused-vars, no-undef, no-shadow */
(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.saveToGoogleCalendar = function () {
      var CLIENT_ID = '158925675835-uhm7ksaftbi7ef3vp9otk9kng4opg4qb.apps.googleusercontent.com';
      var SCOPES = ['https://www.googleapis.com/auth/calendar'];
      var googleAPI = document.createElement('SCRIPT');
      googleAPI.src = 'https://apis.google.com/js/client.js?onload=checkAuth';
      document.head.appendChild(googleAPI);
      function buttons() {
        var newButton = document.createElement('BUTTON');
        newButton.setAttribute('class', 'button button-primary');
        // newButton.setAttribute('onclick', 'alert()');
        newButton.addEventListener('click', newEvent);
        // newButton.click(alert('testing'));
        newButton.innerHTML = 'Save + Calendar';
        document.getElementsByClassName('ynab-grid-actions')[0].appendChild(newButton);
        var authButton = document.createElement('BUTTON');
        authButton.setAttribute('id', 'authorize-button');
        authButton.setAttribute('class', 'ember-view button');
        authButton.setAttribute('title', 'Click to authorize google calendar');
        authButton.addEventListener('click', handleAuthClick);
        authButton.innerHTML = 'Connect Calendar';
        document.getElementsByClassName('accounts-toolbar-left')[0].appendChild(authButton);
      }

      function saveToGoogleCalendarInit() {
        var addTransactionRow = getAddTransactionRow();
        if (addTransactionRow) {
          buttons();
        } else {
          setTimeout(saveToGoogleCalendarInit, 25);
        }
      }

      function getAddTransactionRow() {
        var addRow = document.getElementsByClassName('ynab-grid-add-rows');

        if (addRow.length) {
          var addTransaction = addRow[0].getElementsByClassName('ynab-grid-body-row');
          if (addTransaction.length) {
            return addTransaction[0];
          }

          return null;
        }

        return null;
      }

      /**
       * BEGIN BLOCK FROM GOOGLE API SITE
       *
       * Check if current user has authorized this application.
       * */
      function checkAuth() {
        gapi.auth.authorize(
          { client_id: CLIENT_ID, scope: SCOPES.join(' '), immediate: true }, handleAuthResult);
      }

      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      function handleAuthResult(authResult) {
        var authorizeDiv = document.getElementById('authorize-button');
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          authorizeDiv.style.display = 'none';
          loadCalendarApi();
        } else {
           // Show auth UI, allowing the user to initiate authorization by
           // clicking authorize button.
          authorizeDiv.style.display = 'inline';
        }
      }

      /**
       * Initiate auth flow in response to user clicking authorize button.
       *
       * @param {Event} event Button click event.
       */
      function handleAuthClick(event) {
        gapi.auth.authorize(
        { client_id: CLIENT_ID, scope: SCOPES, immediate: false },
        handleAuthResult);
        return false;
      }

      /**
       * Load Google Calendar client library. List upcoming events
       * once client library is loaded.
       */
      function loadCalendarApi() {
        gapi.client.load('calendar', 'v3', listUpcomingEvents);
      }

      /**
       * Print the summary and start datetime/date of the next ten events in
       * the authorized user's calendar. If no events are found an
       * appropriate message is printed.
       */
      function listUpcomingEvents() {
        var request = gapi.client.calendar.events.list({ calendarId: 'primary', timeMin: (new Date()).toISOString(), showDeleted: false, singleEvents: true, maxResults: 10, orderBy: 'startTime' });
        request.execute(function (resp) {
          var events = resp.items;
          appendPre('Upcoming events:');
          if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
              var event = events[i];
              var when = event.start.dateTime;
              if (!when) {
                when = event.start.date;
              }
              appendPre(event.summary + ' (' + when + ')');
            }
          } else {
            appendPre('No upcoming events found.');
          }
        });
      }

       /**
        * Append a pre element to the body containing the given message
        * as its text node.
        *
        * @param {string} message Text to be placed in pre element.
        */
      function appendPre(message) {
        var pre = document.getElementsByClassName('nav-main');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }

       // Refer to the JavaScript quickstart on how to setup the environment:
       // https://developers.google.com/google-apps/calendar/quickstart/js
       // Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
       // stored credentials.

      function newEvent() {
        var getSave = document.getElementsByClassName('ynab-grid-actions')[0].childNodes[4];
        var event = {
          summary: 'Test event',
          location: '800 Howard St., San Francisco, CA 94103',
          description: 'A chance to hear more about Google\'s developer products.',
          start: {
            date: '2016-09-12'
          },
          end: {
            date: '2016-09-12'
          },
          recurrence: [
            'RRULE:FREQ=DAILY;COUNT=1'
          ]
        };

        var request = gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: event
        });

        request.execute(function (event) {
          // appendPre('Event created: ' + name);
          getSave.click();
          alert('Your event was added to your calendar');
        });

        // document.getElementById('eventName').value = '';
        // This was reseting a form field originally??
      }

      setTimeout(saveToGoogleCalendarInit, 25);
    };

    ynabToolKit.saveToGoogleCalendar(); // Activate itself
  } else {
    setTimeout(poll, 25);
  }
}());
