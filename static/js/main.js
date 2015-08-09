(function() {

  //Load data from CSV file.
  d3.csv('../csv/City Data Spreadsheet - Tallies.csv', function(data) {

    // The csv call is asynchronous, so all processing or drawing happens
    // with this data happens 'inside' the call.

    console.log(data);

  });

})();