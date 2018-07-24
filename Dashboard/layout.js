// https://stackoverflow.com/questions/26176404/converting-only-certain-nodes-in-d3-sankey-chart-from-rectangle-to-circle

var margin = {top: 1, right: 90, bottom: 1, left: 1};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f");
var format = function(d) { return formatNumber(d) + " m3/h"; };
var color = d3.scale.category20();
// http://bl.ocks.org/jfreyre/b1882159636cc9e1283a
// var color = d3.scale.linear().domain([1,length])
//     .interpolate(d3.interpolateHcl)
//     .range([d3.rgb("#007AFF"), d3.rgb('#FFF500')]);

var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
    .nodeWidth(30)
    .nodePadding(5)
    .size([width, height]);

var path = sankey.link();

var freqCounter = 1;

d3.json("zenith.json", function(energy) {

  sankey
      .nodes(energy.nodes)
      .links(energy.links)
      .layout(32);

  // energy.activity.forEach(function (entry) {
  //   console.log(entry);
  // })

  // console.log(energy.links);

var link = svg.append("g").selectAll(".link")
      .data(energy.links)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      // if statement
      // .style("stroke", "#4682B4") // Set color of the line
      .style("stroke", function (d) {
        if(d.activity === true) {
          return "#4682B4";
        } else {
          return "";
        }
      })
      .sort(function(a, b) { return b.dy - a.dy; })
      .attr("fill", d => color(d.name));

  link.append("title")
      .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

  // link.append("number")
  //     .text(function(d) { return d.source.linknr});

  var node = svg.append("g").selectAll(".node")
      .data(energy.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() { this.parentNode.appendChild(this); })
      .on("drag", dragmove));

  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); }) // Filling nodes with color
      // .style("fill", "#4682B4") // Filling nodes with color
      .style("stroke", function(d) {
		  return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) { return d.name + "\n" + format(d.value); });


  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth());
      // .style("writing-mode", "tb");
      // .attr("text-anchor", "start");
      // https://stackoverflow.com/questions/23434850/how-to-align-text-vertically-on-a-node-within-a-sankey-diagram-d3-js

  function dragmove(d) {
    d3.select(this).attr("transform",
        "translate(" + (
            d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
        )
        + "," + (
            d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
        ) + ")");
    sankey.relayout();
    link.attr("d", path);
  }

  // function dragmove(d) {
  //   d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
  //   sankey.relayout();
  //   link.attr("d", path);
  // }
  flow(energy); // add moving particles
  // console.log(energy.links[0]);
});
