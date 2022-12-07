// add d3 data chart

/**
 * This function is to create the button to show the chart.
 * @function
 * @param {HTMLElement} - function for the button to hide and show the data chart
 * @name myFunction
 */
 function myFunction () {
  /**
   * @constant {string} x
   */
  const x = document.getElementById('pie-chart');
  if (x.style.display === 'none') {
    x.style.display = 'block';
    /**
    * @param {string} block Hide the display
    */
  } else {
    x.style.display = 'none';
    /**
    * @param {string} none Show the display
    */
  }
}

// This function is to parse the data from a JSON file to apply to a donut chart.
d3.json('artists.json', function (data) {
  // console.log prints the data in the console
  console.log(data);
  // presrcibe how many data will be shown in the pie chart
  data = data.slice(0, 15);
  const div = d3.select('body').append('div').attr('class', 'toolTip');

// Sizing and placing the donut chart
// create the object to populated with the data
/**
  * @constant {string} w Width of the chart
  */
  const w = 750;
/**
  * @constant {string} h Height of the donut chart
  */
  const h = 750;
/**
  * @constant {string} r Radius of the donut chart
  */
  const r = 250;
/**
  * @constant {string} ir inner radius of the chart
  */
  const ir = 120;
/**
  * @constant {string} textOffset width of the chart
  */
  const textOffset = 20;
/**
  * @constant {string} tweenDuration the border of the chart
  */
  const tweenDuration = 1000;
  let lines;
  let valueLabels;
  let nameLabels;
  let pieData = [];
  let oldPieData = [];
  let filteredPieData = [];

/**
 * @type {Element}
 * @global
 */
// d3 helper function to populate pie slice parameters from array data
  const donut = d3.layout.pie().value(function (d) {
    return d.paintings;
  });

// d3 helper function to create colors from an ordinal scale
/**
 * @constant {color} - color
 */
  const color = d3.scale.category20();
// d3 arc helper function; populates parameter "d" in path object.
  const arc = d3.svg.arc()
    .startAngle(function (d) { return d.startAngle; })
    .endAngle(function (d) { return d.endAngle; })
    .innerRadius(ir)
    .outerRadius(r);

  // create vis and groups
  const vis = d3.select('#pie-chart').append('svg:svg')
    .attr('width', w)
    .attr('height', h);

  // group for arc and paths
  const arcGroup = vis.append('svg:g')
    .attr('class', 'arc')
    .attr('transform', 'translate(' + (w / 2) + ',' + (h / 2) + ')');

  // group for labels
  const labelGroup = vis.append('svg:g')
    .attr('class', 'labelGroup')
    .attr('transform', 'translate(' + (w / 2) + ',' + (h / 2) + ')');

  // group for center text
  const centerGroup = vis.append('svg:g')
    .attr('class', 'centerGroup')
    .attr('transform', 'translate(' + (w / 2) + ',' + (h / 2) + ')');

  // center the text
  // white circle behind the labels
  const whiteCircle = centerGroup.append('svg:circle')
    .attr('fill', 'white')
    .attr('r', ir);

  // STREAKER CONNECTION

  // to run each time data is generated

/**
 * @function
 * @param {Element}
 * @name update
 */
  function update (data) {
    oldPieData = filteredPieData;
    pieData = donut(data);
    let sliceProportion = 0;
    // size of the slice
    filteredPieData = pieData.filter(filterData);

/**
 * @function
 * @param {Element}
 * @name filterData
 */
    function filterData (element, index, array) {
      element.name = data[index].name;
      element.value = data[index].paintings;
      sliceProportion += element.value;
      return (element.value > 0);
    }

    // draw the arc paths
    paths = arcGroup.selectAll('path').data(filteredPieData);
    paths.enter().append('svg:path')
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .attr('fill', function (d, i) { return color(i); })
      .transition()
      .duration(tweenDuration)
      .attrTween('d', pieTween);
    paths
      .transition()
      .duration(tweenDuration)
      .attrTween('d', pieTween);
    paths.exit()
      .transition()
      .duration(tweenDuration)
      .attrTween('d', removePieTween)
      .remove();

    // code for interactive when the mouse moves in each section of the chart.
    paths.on('mousemove', function (d) {
      div.style('left', d3.event.pageX + 10 + 'px');
      div.style('top', d3.event.pageY - 25 + 'px');
      div.style('display', 'inline-block');
      div.html((d.data.name) + '<br>' + (d.data.paintings));
    });

    paths.on('mouseout', function (d) {
      div.style('display', 'none');
    });

    // Draw a line to point to the text and describe the chart.
    lines = labelGroup.selectAll('line').data(filteredPieData);
    lines.enter().append('svg:line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', -r - 5)
      .attr('y2', -r - 16)
      .attr('stroke', 'gray')
      .attr('transform', function (d) {
        return 'rotate(' + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ')';
      });
    lines.transition()
      .duration(tweenDuration)
      .attr('transform', function (d) {
        return 'rotate(' + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ')';
      });
    lines.exit().remove();

    // Draw the label, including the names of the artists and the number of artworks.
    valueLabels = labelGroup.selectAll('text.value').data(filteredPieData)
      .attr('dy', function (d) {
        if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
          return 5;
        } else {
          return -7;
        }
      })
      .attr('text-anchor', function (d) {
        if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
          return 'beginning';
        } else {
          return 'end';
        }
      })
      .text(function (d) {
        const pieces = (d.value);
        return pieces.toFixed(1);
      });

    valueLabels.enter().append('svg:text')
      .attr('class', 'value')
      .attr('transform', function (d) {
        return 'translate(' + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (r + textOffset) + ',' + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (r + textOffset) + ')';
      })
      .attr('dy', function (d) {
        if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
          return 5;
        } else {
          return -7;
        }
      })
      .attr('text-anchor', function (d) {
        if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
          return 'beginning';
        } else {
          return 'end';
        }
      })
      .text(function (d) {
        const pieces = (d.value);
        return pieces.toFixed(0);
      })
      ;

    valueLabels.transition().duration(tweenDuration).attrTween('transform', textTween);

    valueLabels.exit().remove();

    // Draw the label, show the artist names, and point them out from the chart.
    nameLabels = labelGroup.selectAll('text.units').data(filteredPieData)
      .attr('dy', function (d) {
        if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
          return 17;
        } else {
          return 5;
        }
      })
      .attr('text-anchor', function (d) {
        if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
          return 'beginning';
        } else {
          return 'end';
        }
      }).text(function (d) {
        return d.name;
      });

    nameLabels.enter().append('svg:text')
      .attr('class', 'units')
      .attr('transform', function (d) {
        return 'translate(' + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (r + textOffset) + ',' + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (r + textOffset) + ')';
      })
      .attr('dy', function (d) {
        if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
          return 17;
        } else {
          return 5;
        }
      })
      .attr('text-anchor', function (d) {
        if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
          return 'beginning';
        } else {
          return 'end';
        }
      }).text(function (d) {
        return d.name;
      });

    nameLabels.transition().duration(tweenDuration).attrTween('transform', textTween);

    nameLabels.exit().remove();
  }

/**
 * @function
 * @param {Element} - to interpolate the arcs in data space
 * @name pieTween
 */
  function pieTween (d, i) {
    let s0;
    let e0;
    if (oldPieData[i]) {
      s0 = oldPieData[i].startAngle;
      e0 = oldPieData[i].endAngle;
    } else if (!(oldPieData[i]) && oldPieData[i - 1]) {
      s0 = oldPieData[i - 1].endAngle;
      e0 = oldPieData[i - 1].endAngle;
    } else if (!(oldPieData[i - 1]) && oldPieData.length > 0) {
      s0 = oldPieData[oldPieData.length - 1].endAngle;
      e0 = oldPieData[oldPieData.length - 1].endAngle;
    } else {
      s0 = 0;
      e0 = 0;
    }
    i = d3.interpolate({ startAngle: s0, endAngle: e0 }, { startAngle: d.startAngle, endAngle: d.endAngle });
    return function (t) {
      const b = i(t);
      return arc(b);
    };
  }

/**
 * @function
 * @param {Element}
 * @name removePieTween
 */
  function removePieTween (d, i) {
    s0 = 2 * Math.PI;
    e0 = 2 * Math.PI;
    i = d3.interpolate({ startAngle: d.startAngle, endAngle: d.endAngle }, { startAngle: s0, endAngle: e0 });
    return function (t) {
      const b = i(t);
      return arc(b);
    };
  }

/**
 * @function
 * @param {Element}
 * @name textTween
 */
  function textTween (d, i) {
    let a;
    if (oldPieData[i]) {
      a = (oldPieData[i].startAngle + oldPieData[i].endAngle - Math.PI) / 2;
    } else if (!(oldPieData[i]) && oldPieData[i - 1]) {
      a = (oldPieData[i - 1].startAngle + oldPieData[i - 1].endAngle - Math.PI) / 2;
    } else if (!(oldPieData[i - 1]) && oldPieData.length > 0) {
      a = (oldPieData[oldPieData.length - 1].startAngle + oldPieData[oldPieData.length - 1].endAngle - Math.PI) / 2;
    } else {
      a = 0;
    }
    const b = (d.startAngle + d.endAngle - Math.PI) / 2;
    const fn = d3.interpolateNumber(a, b);
    return function (t) {
      const val = fn(t);
      return 'translate(' + Math.cos(val) * (r + textOffset) + ',' + Math.sin(val) * (r + textOffset) + ')';
    };
  }

  update(data);
});

// create grid gallery
// button for artists information

/**
 * This function for create the button show the artists information section
 * @function
 * @param {HTMLElement} - the button for hide and show the artists information section
 * @name myFunction1
 */
 function myFunction1 () {
  const x = document.getElementById('button1');
  if (x.style.display === 'none') {
    x.style.display = 'block';
  } else {
    x.style.display = 'none';
  }
}

// button for paintings grid
/**
 * This function for create the button show the paintings grid section
 * @function
 * @param {HTMLElement} - the button for hide and show the paintings grid section
 * @name myPaintings
 */
function myPaintings () {
  const x = document.getElementById('paintings-grid');
  if (x.style.display === 'none') {
    x.style.display = 'block';
  } else {
    x.style.display = 'none';
  }
}

// sticky the submit form

window.onscroll = function () {
  myForm();
};

var navbar = document.getElementById('navbar');
var sticky = navbar.offsetTop;

/**
 * @function
 * @param {HTMLelement} - The function for fixing the navbar when scrolling through the page
 * @name myForm
 */
function myForm () {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add('sticky');
  } else {
    navbar.classList.remove('sticky');
  }
}
