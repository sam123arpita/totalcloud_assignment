var demo = (function() {
    var data = []; // global variable to keep the data cached
  
    function onLoad() {
      // 1. Create a new XMLHttpRequest object
      let xhr = new XMLHttpRequest();
  
      // 2. Configure it: GET-request for the URL /article/.../load
      xhr.open('GET', ' https://totalcloud-static.s3.amazonaws.com/intern.json');
  
      // 3. Send the request over the network
      xhr.send();
  
      // 4. This will be called after the response is received
      xhr.onload = function() {
        if (xhr.status != 200) { // analyze HTTP status of the response
          alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
        } else { // save the result to data in JSON format
          data = JSON.parse(xhr.responseText);
          createTableAndAppendToBody(); // load the table dynamically
        }
      };
  
      xhr.onerror = function() {
        //if there is an error loading xhr request this will show alert
        alert("XHR Request failed");
      };
    }
  
    function createTableAndAppendToBody() {
      if (data && data.length > 0) {
        var node = '';
        var rows = '';
        //Create headers of the table
        var headerDiv = '<div class="row border-bottom border-right">';
        headerDiv += '<div class="col-md-6 col-lg-6 border-left">intern-assignment</div>';
        headerDiv += '<div class="col-md-3 col-lg-3 ">Start Date</div>';
        headerDiv += '<div class="col-md-3 col-lg-3 ">Due Date</div> ';
        headerDiv += '</div>';
        for (var i = 0; i < data.length; i++) {
          //Using moment.js to format date. Moment is a date utility js library.
          var startDate = moment(data[i].start, 'DD-MM-YYYY').format('DD MMM');
          var dueDate = moment(data[i].end, 'DD-MM-YYYY').format('DD MMM');
          rows += `<div class="row intern_${i}">`;
          //Adding borders are tricky.
          if (i === data.length - 1)
            rows += `<div class="col-md-1 col-lg-1 border-left border-right border-bottom intern_id">${data[i].id}</div>`;
          else
            rows += `<div class="col-md-1 col-lg-1 border-left border-right intern_id">${data[i].id}</div>`;
          rows += `<div class="col-md-1 col-lg-1 border-bottom"><input type="checkbox"/></div>`;
          rows += `<div class="col-md-4 col-lg-4 border-bottom">${data[i].name}</div>`;
          rows += `<div class="col-md-3 col-lg-3 border-bottom">${startDate}</div>`;
          rows += `<div class="col-md-3 col-lg-3 border-bottom border-right">${dueDate}</div>`;
          rows += '</div>';
        }
        node = headerDiv + rows;
        $('.data-table').html($(node)); //Append the table content to data-table div in body
      }
    }
  
    function onButtonClick() {
      //button click handler function - initializes google chart    
      google.charts.load('current', {
        packages: ['timeline']
      });
      google.charts.setOnLoadCallback(loadChart);
    }
  
    function loadChart() {
       //I could not make the chart as per design in this time freame, but I have tried to show the data you mentioned in chart
      //chart loading function. This function also formats data for the available and occupied dates
      var mappedData = [];
      var occupiedDates = [];
      var allDatesinSep2019 = [];
      var container = document.getElementById('calendar_basic');
      var chart = new google.visualization.Timeline(container);
      var dataTable = new google.visualization.DataTable();
  
      //create an array with all dates in SEp 2019. I have hardcoed it for now
      for (var j = 1; j < 31; j++) {
        allDatesinSep2019.push(`${j}/9/2019`);
      }
      //loop through data and create mappedData for charts. Also populating occupiedDates data here, so that w ecan show alaivale date in chart 
      for (var i = 0; i < data.length; i++) {
        var startDate = moment(data[i].start, 'DD-MM-YYYY').toDate();
        var dueDate = moment(data[i].end, 'DD-MM-YYYY').toDate();
        var range = moment.range(moment(startDate), moment(dueDate)); //moment.range helps to get all dates in between a date range
        occupiedDates.push(Array.from(range.by('day')).map(d => d.format('D/M/YYYY'))); // creating an array with all occupied dates for now it's 2d array, will flattern latter.
        mappedData.push(['occupied', data[i].name, startDate, dueDate]); //data for maps - using id as occupied and everyOneFree free sho that we distinguish later
      }
  
      var occupiedDates = [...new Set([].concat.apply([], occupiedDates))]; //using spread operator ... and then creating a set 
      //to get unique dates as some users have overlaping schedule
      var freeDays = allDatesinSep2019.filter(x => !occupiedDates.includes(x)); //yusing array.filter to find out free days
  
      //creating chart data for free days
      for (var i = 0; i < freeDays.length; i++) {
        var startDate = moment(freeDays[i], 'DD-MM-YYYY').toDate();
        var dueDate = moment(freeDays[i], 'DD-MM-YYYY').toDate();
        mappedData.push(['everyOneFree', '', startDate, dueDate]);
      }
      //chart columns
      dataTable.addColumn({
        type: 'string',
        id: 'Id'
      })
      dataTable.addColumn({
        type: 'string',
        id: 'Name'
      });
      dataTable.addColumn({
        type: 'date',
        id: 'Start'
      });
      dataTable.addColumn({
        type: 'date',
        id: 'End'
      });
      dataTable.addRows(mappedData);
      //chart options
      var options = {
        colors: ['#0095ff', '#19e10c'],
        timeline: {
          showRowLabels: false,
          colorByRowLabel: true,
          groupByRowLabel: false
        }
      };
      //draw chart
      chart.draw(dataTable, options);
    }
  
    //public functions
    return {
      init: function() {
        onLoad();
      },
      onClick: onButtonClick
    }
  });
  
  $(document).ready(function() {
    //initialize when document load is complete
    var instance = new demo(); //create an instance of demo class, to access public methods
    //binf onClick event on button to load chart functionality
    window['moment-range'].extendMoment(moment);
    $(".check-availability").on('click', function() {
      instance.onClick();
    });
    instance.init(); // initialize xhr call on load
  });