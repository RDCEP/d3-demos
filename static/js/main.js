(function() {

  // Better margins so we can see the axis text and tooltip
  var margin = {top: 30, right: 10, bottom: 30, left:30}
    , w = 600
    , h = 400
    , width = w - margin.right - margin.left
    , height = h - margin.top - margin.bottom
    , x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1)
    , y = d3.scale.linear()
      .range([height, 0])
    , svg = d3.select('main').append('svg')
      .attr('width', w)
      .attr('height', h)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    , x_axis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
    , y_axis = d3.svg.axis()
      .scale(y)
      .orient('left')
    , x_axis_layer = svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
    , y_axis_layer = svg.append('g')
      .attr('class', 'y axis')
    // Create a tooltip object
    , tooltip = d3.select('#tooltip')
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

      // Compact titles for chart
      d.Date = d.Date.split('/').slice(0,2).join('/');

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

    var v = 'ForSale';

    x.domain(data_by_area.map(function(d) { return d.key; }));
    y.domain([0, d3.max(data_by_area, function(d) { return d.values[v]; })]);

    svg.selectAll('.bar')
      .data(data_by_area)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d) { return x(d.key); })
      .attr('y', function(d) { return y(d.values[v]); })
      .attr('height', function(d) { return height - y(d.values[v]); })
      .attr('width', x.rangeBand())
      // Add hover tooltip
      .on('mouseover', function(d) {
        // Add .hovered class to bar for CSS styles
        d3.select(this).classed('hovered', true);
        // Change tooltip text and styles
        tooltip.text(d.values[v])
          .style({
            display: 'block',
            width: x.rangeBand()+'px',
            left: (x(d.key) + margin.left)+'px',
            bottom: (height + margin.bottom - y(d.values[v]) + 5)+'px'
          });
      })
      .on('mouseout', function(d) {
        // Remove .hovered on bar and hide tooltip
        d3.select(this).classed('hovered', false);
        tooltip.style({
            display: 'none'
          });
      })
    ;

    x_axis_layer.call(x_axis);
    y_axis_layer.call(y_axis);

  });

})();