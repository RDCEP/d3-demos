(function() {

  // A function that will let us parse the date strings in the CSV as
  // Date objects in JavaScript
  var datetime_format = d3.time.format('%-m/%d/%Y%H:%M');

  d3.csv('../csv/City Data Spreadsheet - Tallies.csv', function(data) {

    // Pre-process the CSV data as needed
    data.forEach(function(d) {

      // Create a Date out of the Date and Time columns
      d.DateTime = datetime_format.parse(d.Date + d.Time);

      // all data from the CSV is initially a string. We want numeric
      // values to be stored as numeric objects in JavaScript. And null,
      // true, and false should have decent representations as well.
      var numeric_headers = [
        'NeighborhoodWatchSigns', 'WeCallPolice', 'TresspassingSign',
        'DogSign', 'AlarmSystem', ' ForRent', 'ForSale', 'FallenTree',
        'Construction', 'VacantLots', 'IllegalDumping', 'BoardedUp',
        'NoSolicitation'],
        boolean_headers = ['OfficialBoolean']
      ;

      for (var k in d) {
        if (d.hasOwnProperty(k)) {

          if (numeric_headers.indexOf(k) >= 0) {
            // This is too simplified to work for the CSV. Some values
            // Are neither 'null' nor a digit. Presently they'll evaluate
            // to NaN.
            d[k] = (d[k] == 'null') ? null : +d[k];
          }

          if (boolean_headers.indexOf(k) >= 0) {
            d[k] = d[k] != 'FALSE';
          }

        }
      }

    });

    console.log(data);

  });

})();