import React, { Component } from "react";
import * as d3 from "d3";
import "./D3Component.css";

const WIDTH = 700;
const HEIGHT = 500;
const MARGIN = { top: 10, right: 10, bottom: 20, left: 30 };
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const X_DOMAIN = [-10, 50];
const Y_DOMAIN = [-50, 20];
const X_SCALE = d3.scaleLinear().domain(X_DOMAIN).range([0, INNER_WIDTH]);
const Y_SCALE = d3.scaleLinear().domain(Y_DOMAIN).range([INNER_HEIGHT, 0]);
const WALKINGLINE = d3
  .line()
  .x((d) => X_SCALE(d.x))
  .y((d) => Y_SCALE(d.y));
const PRECISION = 100;

export default class D3Component extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      walkingValues: [],
    };
  }

  showGraph(xVal) {
    const svg = d3
      .select("#grid")
      .append("svg")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .append("g")
      .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");

    const xAxis = d3.axisBottom(X_SCALE).ticks(10);
    const yAxis = d3.axisLeft(Y_SCALE).ticks(10);
    const xAxisGrid = d3
      .axisBottom(X_SCALE)
      .tickSize(-INNER_HEIGHT)
      .tickFormat("")
      .ticks(10);
    const yAxisGrid = d3
      .axisLeft(Y_SCALE)
      .tickSize(-INNER_WIDTH)
      .tickFormat("")
      .ticks(10);

    // Create grids.
    svg
      .append("g")
      .attr("class", "x axis-grid")
      .attr("transform", "translate(0," + INNER_HEIGHT + ")")
      .call(xAxisGrid);
    svg.append("g").attr("class", "y axis-grid").call(yAxisGrid);
    // Create axes.
    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + INNER_HEIGHT + ")")
      .call(xAxis);
    svg.append("g").attr("class", "y axis").call(yAxis);

    //add line
    //const line = d3.line().x((d) => x(d)).y((d) => y(yfunc(d)));

    //const values = genXvals(xDomain, yfunc);
    //console.log(values);
    //console.log(walkinLine(walkingValues));
    //line(values);
    svg
      .append("path")
      .attr("id", "graph1")
      .attr("d", WALKINGLINE(xVal))
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3.5);

    //make 0 axes bold
    svg
      .append("path")
      .attr("id", "x-axis")
      .attr(
        "d",
        WALKINGLINE([
          { x: X_DOMAIN[0] - (X_DOMAIN[1] - X_DOMAIN[0]) / 120, y: 0 },
          { x: X_DOMAIN[1], y: 0 },
        ])
      )
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 3.5);
    svg
      .append("path")
      .attr("id", "x-axis")
      .attr(
        "d",
        WALKINGLINE([
          { x: 0, y: Y_DOMAIN[0] - (Y_DOMAIN[1] - Y_DOMAIN[0]) / 80 },
          { x: 0, y: Y_DOMAIN[1] },
        ])
      )
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 3.5);
  }

  componentDidMount() {
    console.log("mounted");
    const walkingValues = genWalkingData(X_DOMAIN, this.props.yfunc, PRECISION);

    this.showGraph(walkingValues.slice(0, 1));

    for (let i = 1; i < walkingValues.length; i++) {
      const tempVal = walkingValues.slice(0, i + 1);
      //setTimeout(() => {
      this.setState({
        walkingValues: tempVal,
      });
      //}, 10 * i/PRECISION);
    }
  }

  componentDidUpdate() {
    //console.log("updated");
    const walkingValueSnapShot = this.state.walkingValues;
    //console.log("walkingValuesSnapShot: ", walkingValueSnapShot);
    d3.select("#grid").select("svg").remove();
    this.showGraph(walkingValueSnapShot);
  }

  render() {
    //console.log("rendered");
    return <div id="grid" ref={this.myRef}></div>;
  }
}

const genWalkingData = (xDomain, yfunc, precision) => {
  //replay;
  const data = [];
  for (let i = xDomain[0] * precision; i <= xDomain[1] * precision; i++) {
    const x = i / precision;
    const y = yfunc(x);
    if (!((y !== 0 && !y) || y === Infinity || y === -Infinity))
      data.push({ x: x, y: y });
  }
  return data;
};

const genXvals = (xDomain, yfunc) => {
  const values = [];
  for (let i = xDomain[0]; i <= xDomain[1]; i++) {
    values.push(i);
    const y = yfunc(i);
    if ((y !== 0 && !y) || y === Infinity || y === -Infinity) values.pop();
  }

  return values;
};

const genYvals = (xVals, yfunc) => {
  const values = [];
  for (let x in xVals) {
    values.push(yfunc(x));
    //values.push(i);
    //if(yfunc(i)==null || yfunc(i)=== Infinity) values.pop();
  }

  return values;
};
