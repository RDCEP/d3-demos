(function() {

  var datetime_format = d3.time.format('%-m/%d/%Y%H:%M')
    , data_by_area
  ;

  d3.csv('../csv/City Data Spreadsheet - Tallies.csv', function(data) {

    var numeric_headers = [
        'NeighborhoodWatchSigns', 'WeCallPolice', 'TresspassingSign',
        'DogSign', 'AlarmSystem', ' ForRent', 'ForSale', 'FallenTree',
        'Construction', 'VacantLots', 'IllegalDumping', 'BoardedUp',
        'NoSolicitation']
      , boolean_headers = ['OfficialBoolean']
    ;

    data.forEach(function(d) {

      d.DateTime = datetime_format.parse(d.Date + d.Time);

      for (var k in d) {
        if (d.hasOwnProperty(k)) {

          if (numeric_headers.indexOf(k) >= 0) {
            d[k] = (d[k] == 'null') ? null : +d[k];
          }

          if (boolean_headers.indexOf(k) >= 0) {
            d[k] = d[k] != 'FALSE';
          }

        }
      }

    });

    // d3 nest() can be confusing. The data isn't really in a usable form,
    // with each datum in its own row. We need to 'group' it somehow. We'll
    // group it by Date (since these dates ultimately represent areas of
    // the city). Then we need to construct an object that holds the sum
    // of several columns in the CSV.
    data_by_area = d3.nest()
      .key(function(d) { return d.Date; })
      .rollup(function(leaves) {
        var o = {};
        for (var i = 0; i < numeric_headers.length; ++i) {
          o[numeric_headers[i]] = d3.sum(leaves, function(d) {return d[numeric_headers[i]]; })
        }
        return o;
      })
      .entries(data);

    console.log(data_by_area);

  });

})();