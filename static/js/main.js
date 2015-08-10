(function() {

  var margin = {top: 30, right: 10, bottom: 60, left:60}
    , w = 600
    , h = 400
    , width = w - margin.right - margin.left
    , height = h - margin.top - margin.bottom
    , datetime_format = d3.time.format('%-m/%d/%Y%H:%M')
    , data_by_area
  ;

  function to_title(text) {
    return text.replace(/(.)([A-Z])/g, '$1 $2');
  }

  function trend(data, x, y) {
    var reduce_sum = function(a, b) { return a + b; }
      , n = data.length
      , xys = d3.sum(data.map(function(d) { return d.values[x] * d.values[y]; }))
      , xs = d3.sum(data.map(function(d) { return d.values[x]; }))
      , xxs = d3.sum(data.map(function(d) { return d.values[x] ^ 2; }))
      , ys = d3.sum(data.map(function(d) { return d.values[y]; }))
      , m = (n * xys - xs * ys) / (n * xxs - xs * xs)
      , b = (ys - m * xs) / n
    ;
    console.log(m, b);
    return function(x) { return (m * x + b); };
  }

  function Bars(data, data_by_area) {

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1)
      , y = d3.scale.linear()
        .range([height, 0])
      , svg = d3.select('#bars').append('svg')
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
      , tooltip = d3.select('#bars .tooltip')
      , b = 'ForSale'
    ;

    x.domain(data_by_area.map(function (d) {
      return d.key;
    }));
    y.domain([0, d3.max(data_by_area, function (d) {
      return d.values[b];
    })]);

    svg.selectAll('.bar')
      .data(data_by_area)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function (d) {
        return x(d.key);
      })
      .attr('y', function (d) {
        return y(d.values[b]);
      })
      .attr('height', function (d) {
        return height - y(d.values[b]);
      })
      .attr('width', x.rangeBand())
      .on('mouseover', function (d) {
        d3.select(this).classed('hovered', true);
        tooltip.text(d.values[b])
          .style({
            display: 'block',
            width: x.rangeBand() + 'px',
            left: (x(d.key) + margin.left) + 'px',
            bottom: (height + margin.bottom - y(d.values[b]) + 5) + 'px'
          });
      })
      .on('mouseout', function (d) {
        d3.select(this).classed('hovered', false);
        tooltip.style({
          display: 'none'
        });
      })
    ;

    d3.select('#bars h2')
      .text(to_title(b) + ' by Neighborhood')
      .style('margin-left', margin.left+'px');

    x_axis_layer.append('text')
      .text('Neighborhood')
      .attr('x', 0)
      .attr('y', 40);
    y_axis_layer.append('text')
      .text(to_title(b))
      .attr('transform', 'rotate(-90)')
      .attr('x', -height)
      .attr('y', -30);

    x_axis_layer.call(x_axis);
    y_axis_layer.call(y_axis);

  }

  function Scatter(data, data_by_area) {

    var x = d3.scale.linear()
        .range([0, width])
      , y = d3.scale.linear()
        .range([height, 0])
      , svg = d3.select('#scatter').append('svg')
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
      ;

    var a = 'ForSale'
      , b = 'ForRent'
      , _t = trend(data_by_area, a, b);

    x.domain([0, d3.max(data_by_area, function (d) {
      return d.values[a];
    })]);
    y.domain([0, d3.max(data_by_area, function (d) {
      return d.values[b];
    })]);

    svg.append('g').append('path')
      .attr('d', 'M ' + x.range()[0] + ' ' + y(_t(x.domain()[0])) + ' L ' + x.range()[1] + ' ' + y(_t(x.domain()[1])))
      .attr('class', 'trend');

    svg.selectAll('.dot')
      .data(data_by_area)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', function (d) {
        return x(d.values[a]);
      })
      .attr('cy', function (d) {
        return y(d.values[b]);
      })
      .attr('r', function () {
        return 8;
      });

    d3.select('#scatter h2')
      .text(to_title(a) + ' v. ' + to_title(b))
      .style('margin-left', margin.left+'px');

    x_axis_layer.append('text')
      .text(to_title(a))
      .attr('x', 0)
      .attr('y', 40);
    y_axis_layer.append('text')
      .text(to_title(b))
      .attr('transform', 'rotate(-90)')
      .attr('x', -height)
      .attr('y', -30);

    x_axis_layer.call(x_axis);
    y_axis_layer.call(y_axis);

  }

  d3.csv('../csv/City Data Spreadsheet - Tallies.csv', function(data) {

    var numeric_headers = [
        'NeighborhoodWatchSigns', 'WeCallPolice', 'TresspassingSign',
        'DogSign', 'AlarmSystem', 'ForRent', 'ForSale', 'FallenTree',
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

    Bars(data, data_by_area);
    Scatter(data, data_by_area);

  });

})();