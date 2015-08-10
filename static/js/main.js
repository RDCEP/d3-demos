(function() {

  // A load of new variables for our chart. Beginning with basic layout:
  // height, width, and margins.
  var margin = {top: 10, right: 10, bottom: 10, left:10}
    , w = 600
    , h = 400
    , width = w - margin.right - margin.left
    , height = h - margin.top - margin.bottom
    // x and y scales.
    , x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1)
    , y = d3.scale.linear()
      .range([height, 0])
    // The <svg> element, and a child <g> appended
    , svg = d3.select('body').append('svg')
      .attr('width', w)
      .attr('height', h)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    // functions to draw the x- and y-axes
    , x_axis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
    , y_axis = d3.svg.axis()
      .scale(y)
      .orient('left')
    // 'Layers' (<g> elements) for the axes
    , x_axis_layer = svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
    , y_axis_layer = svg.append('g')
      .attr('class', 'y axis')
    , datetime_format = d3.time.format('%-m/%d/%Y%H:%M')
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

    // Set the domains of x and y
    // The domain of x will be an array of all the dates on which
    // data was recorded --- effectively neighborhoods. This is stored
    // as the key of the objects in the nested data.
    x.domain(data_by_area.map(function(d) { return d.key; }));

    // The domain of y is from zero the maximum amount of ForSale signs
    // (or whatever else we want to chart).
    y.domain([0, d3.max(data_by_area, function(d) { return d.values.ForSale; })]);

    // This is really the brunt of d3 --- this is where data gets bound to
    // elements. We selectAll() several objects *that don't yet exist*.
    // Then data() assigns values to those objects (it's argument must be an
    // array). enter() finally creates the objects. And append() creates
    // and element in our HTML for each object.
    svg.selectAll('.bar')
      .data(data_by_area)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d) { return x(d.key); })
      .attr('y', function(d) { return y(d.values.ForSale); })
      .attr('height', function(d) { return height - y(d.values.ForSale); })
      .attr('width', x.rangeBand());

    // Draw the axes
    x_axis_layer.call(x_axis);
    y_axis_layer.call(y_axis);

  });

})();