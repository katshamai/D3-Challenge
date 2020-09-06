var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var scatterGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("../assets/data/data.csv").then(function(demoData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
demoData.forEach(function(row) {
  row.age = +row.age;
  row.smokes = +row.smokes;
  row.state = row.abbr;
})

    // Step 2: Create scale functions
    // ==============================
    // create scales
    var xLinearScale = d3.scaleLinear()
    .domain(d3.extent(demoData, d => d.age))
    .range([0, width]);

    var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(demoData, d => d.smokes)])
    .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var xAxis = d3.axisBottom(xLinearScale);
    var yAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    scatterGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);
    
    scatterGroup.append("g")
    .call(yAxis);

    // Step 5: Create Circles
    // ==============================
    circleGroup = scatterGroup.selectAll("circle")
    .data(demoData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.age))
    .attr("cy", d => yLinearScale(d.smokes))
    .attr("r", 10)
    .attr("fill", "#89bdd3")
    .attr("stroke", "#e3e3e3");

    // Step 6: Insert State Abbr into circles
    // ==============================
    scatterGroup.select("g")
    .selectAll("circle")
    .data(demoData)
    .enter()
    .append("text")
    .text(d => d.state)
    .attr("x", d => xLinearScale(d.age))
    .attr("y", d => yLinearScale(d.smokes))
    .attr("dy",-395)
    .attr("text-anchor", "middle")
    .attr("font-size", "8px")
    .attr("fill", "black");

    // Create axes labels
    scatterGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Smokers");

    scatterGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("Age");
  }).catch(function(error) {
    console.log(error);
  });
