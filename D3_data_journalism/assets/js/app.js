var svgWidth = 960;
var svgHeight = 400;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "age";
var chosenYAxis = "smokes";

// function used for updating x-scale var upon click on axis label
function xScale(demoData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(demoData, d => d[chosenXAxis]) * 0.8,
      d3.max(demoData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}
// Function used for updating y-scale variable upon click on axis label.
function yScale(demoData, chosenYAxis) {
  // Create Scales.
  var yLinearScale = d3.scaleLinear()
      .domain([d3.min(demoData, d => d[chosenYAxis]) * 0.8,
          d3.max(demoData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Function used for updating yAxis var upon click on axis label.
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
      .duration(1000)
      .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// Function used for updating text in circles group with a transition to new text.
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circletextGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]))
      .attr("text-anchor", "middle");
  
  return circletextGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circletextGroup) {

  if (chosenXAxis === "age") {
    var xLabel = "Age";
  }
  else {
    var xLabel = "In Poverty (%)";
  }

  // Conditional for Y Axis.
  if (chosenYAxis === "smokes") {
    var yLabel = "Smoker (%)";
}
else {
    var yLabel = "Lacks Healthcare (%)"
}

// Initialise Tool Tip
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([90, 90])
    .html(function(d) {
      return (`<strong>${d.abbr}</strong><br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
  
  // Create circles tool tip
  circlesGroup.call(toolTip);

  // Create event listener for mouseover trigger
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  // Create Text Tooltip in the Chart
  circletextGroup.call(toolTip);
  // Create Event Listeners to Display and Hide the Text Tooltip
  circletextGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout Event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  return circlesGroup;
});

// Retrieve data from the CSV file and execute everything below
d3.csv("../assets/data/data.csv").then(function(demoData) {

  // parse data
  demoData.forEach(function(data) {
    data.state = data.state;
    data.abbr = data.abbr;
    data.smokes = +data.smokes;
    data.age = +data.age;
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
  });
  // xLinearScale function above csv import
  var xLinearScale = xScale(demoData, chosenXAxis);
  var yLinearScale = yScale(demoData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(demoData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("class", "stateCircle")
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

    // Add State abbr. text to circles.
    var circletextGroup = chartGroup.selectAll(".stateText")
    .data(demoData)
    .enter()
    .append("text")
    .text(d => (d.abbr))
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("class","stateText")
    .style("font-size", "12px")
    .style("text-anchor", "middle")
    .style("fill", "black");

  // Create group for two x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "Age") // value to grab for event listener
    .classed("active", true)
    .text("Age (Median)");

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("In Poverty (%)");

  // Create group for two y-axis labels
  var yLabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(-25, ${height / 2})`);

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (margin.left) * 2.5)
    .attr("y", 0 - (height - 60))
    .attr("value", "healthcare") // value to grab for event listener.
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  var smokeLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (margin.left) * 2.5)
    .attr("y", 0 - (height - 40))
    .attr("value", "smokes") // value to grab for event listener.
    .classed("active", true)
    .text("Smokes (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circletextGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // updates x scale for new data
        xLinearScale = xScale(demoData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // Update text with new values
        circletextGroup = renderText(circletextGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis, circletextGroup);

        // changes classes to change bold text
        if (chosenXAxis === "Age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        };

  // yAxis Labels event listener
        yLabelsGroup.selectAll("text")
        .on("click", function() {
          var value = d3.select(this).attr("value");
          if(value !== chosenYAxis) {

            chosenYAxis = value;

            // update yScale with selection
            yLinearScale = yScale(demoData, chosenYAxis);

            // update yAxis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);

            // Update circles with new values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // Update Text with new values
            circletextGroup = renderText(circletextGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // Update tool tips
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circletextGroup);

            // Changes classes to change bold text.
        if (chosenYAxis === "healthcare") {
          healthcareLabel
              .classed("active", true)
              .classed("inactive", false);

          smokeLabel
              .classed("active", false)
              .classed("inactive", true);
      }
      else {
          healthcareLabel
              .classed("active", false)
              .classed("inactive", true);

          smokeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
      };
    });
  });
};
