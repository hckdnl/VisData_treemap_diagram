import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import "./App.css";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    d3.json(
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
    ).then(setData);
  }, []);

  useEffect(() => {
    if (data) {
      createTreeMap();
    }
  }, [data]);

  const createTreeMap = () => {
    const width = 960;
    const height = 600;
    d3.select("#tree-map").selectAll("svg").remove();

    const totalHeight = height + 180;
    const svg = d3.select("#tree-map")
  .append("svg")
  .attr("width", width)
  .attr("height", totalHeight);

    const group = svg.append("g");

    const treemap = d3.treemap().size([width, height]).paddingInner(1);

    const root = d3
      .hierarchy(data)
      .eachBefore((d) => {
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
      })
      .sum((d) => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.value);

    treemap(root);

    const categories = root.leaves().map((nodes) => nodes.data.category);
    const distinctCategories = [...new Set(categories)];
    const color = d3
      .scaleOrdinal(d3.schemeCategory10)
      .domain(distinctCategories);

    const cell = group
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    cell
      .append("rect")
      .attr("class", "tile")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value)
      .attr("fill", (d) => color(d.data.category))
      .on("mouseover", (event, d) => {
        const tooltip = d3.select("#tooltip");
        tooltip
          .style("opacity", 0.9)
          .attr("data-value", d.data.value)
          .html(
            `Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
      });

    cell
      .append("text")
      .attr("class", "tile-text")
      .selectAll("tspan")
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append("tspan")
      .attr("x", 4)
      .attr("y", (d, i) => 13 + i * 10)
      .text((d) => d);

    // Legend
const LEGEND_OFFSET = 15;
const LEGEND_ROW_HEIGHT = 25;
const LEGEND_RECT_SIZE = 15;
const LEGEND_TEXT_PADDING = 5;
const NUM_COLUMNS = 3; // Number of columns in the legend

const columnWidth = (width - LEGEND_OFFSET - 500) / NUM_COLUMNS;
const numRows = Math.ceil(distinctCategories.length / NUM_COLUMNS);
const legendWidth = NUM_COLUMNS * (columnWidth + LEGEND_TEXT_PADDING) - LEGEND_TEXT_PADDING;
const xPosition = (width - legendWidth) / 2;


const legend = svg.append("g")
  .attr("id", "legend")
  .attr("transform", `translate(${xPosition},${height + LEGEND_OFFSET})`);

  distinctCategories.forEach((category, index) => {
    const columnIndex = index % NUM_COLUMNS;
    const rowIndex = Math.floor(index / NUM_COLUMNS);
    const xPosition = columnIndex * (columnWidth + LEGEND_TEXT_PADDING); // Adjusted xPosition
    const yPosition = rowIndex * LEGEND_ROW_HEIGHT;
  
    const legendItem = legend.append("g")
      .attr("transform", `translate(${xPosition},${yPosition})`);
  
    legendItem.append("rect")
      .attr("class", "legend-item")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", LEGEND_RECT_SIZE)
      .attr("height", LEGEND_RECT_SIZE)
      .attr("fill", color(category));
  
    legendItem.append("text")
      .attr("x", LEGEND_RECT_SIZE + LEGEND_TEXT_PADDING)
      .attr("y", LEGEND_RECT_SIZE)
      .text(category);
  });

    
  };

  return (
    <div className="App">
      <h1 id="title">Video Game Sales</h1>
      <p id="description">Top 100 Most Sold Video Games Grouped by Platform</p>
      <div id="tree-map"></div>
      <div id="tooltip" style={{ position: "absolute", opacity: 0 }}></div>
    </div>
  );
}

export default App;
