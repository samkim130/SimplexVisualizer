import React, { Component } from "react";
import * as d3 from "d3";
//import "./D3Component.css";
//import { set } from "d3";
/**
 * maybe add linear algebra calculation to calculate valid points
 */
const PALLET = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];
const WIDTH = 730;
const HEIGHT = 520;
const MARGIN = { top: 10, right: 10, bottom: 30, left: 40 };
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const X_DOMAIN = [-10, 30];
const Y_DOMAIN = [-20, 30];
const X_SCALE = d3.scaleLinear().domain(X_DOMAIN).range([0, INNER_WIDTH]);
const Y_SCALE = d3.scaleLinear().domain(Y_DOMAIN).range([INNER_HEIGHT, 0]);
const DEFAULT_LINE = d3
  .line()
  .x((d) => X_SCALE(d.x))
  .y((d) => Y_SCALE(d.y));
const SOL_RADIUS = 5;
//const PRECISION = 100;

export default class D3Component extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      walkingValues: [],
      svg: null,
    };
  }

  graphSetUp() {
    const svg = d3
      .select("#grid")
      .append("svg")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .append("g")
      .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");
    this.setState({ svg: svg });
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

    // AXIS label
    svg
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", MARGIN.left + INNER_WIDTH / 2)
      .attr("y", HEIGHT - MARGIN.top)
      .attr("font-weight", "bold")
      .attr("font-size", "22px")
      .text("X1");
    svg
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("x", -MARGIN.top - INNER_HEIGHT / 2)
      .attr("y", -MARGIN.left - 1)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .attr("font-weight", "bold")
      .attr("font-size", "22px")
      .text("X2");

    //make 0 axes bold
    svg
      .append("path")
      .attr("id", "x-axis-bolded")
      .attr(
        "d",
        DEFAULT_LINE([
          { x: X_DOMAIN[0] - (X_DOMAIN[1] - X_DOMAIN[0]) / 120, y: 0 },
          { x: X_DOMAIN[1], y: 0 },
        ])
      )
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 3.5);
    svg
      .append("path")
      .attr("id", "y-axis-bolded")
      .attr(
        "d",
        DEFAULT_LINE([
          { x: 0, y: Y_DOMAIN[0] - (Y_DOMAIN[1] - Y_DOMAIN[0]) / 80 },
          { x: 0, y: Y_DOMAIN[1] },
        ])
      )
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 3.5);

    svg.append("g").attr("id", "equations-imported");
  }

  graphDraw() {
    const { svg } = this.state;
    const { modelData, modelValid, modelResult } = this.props;
    if (modelValid) {
      d3.select("#equations-imported").selectAll("polygon").remove();
      d3.select("#equations-imported").selectAll("path").remove();
      d3.select("#equations-imported").selectAll("circle").remove();
      console.log("model passed");
      createGraphics(svg, modelData);
      createDots(svg, modelResult);
    }
  }

  componentDidMount() {
    console.log("mounted");
    //const walkingValues = genCurvedGraphData(X_DOMAIN, this.props.yfunc, PRECISION);
    this.graphSetUp();
  }

  componentDidUpdate() {
    console.log("graph updated");
    this.graphDraw();
    //const walkingValueSnapShot = this.state.walkingValues;
    //console.log("walkingValuesSnapShot: ", walkingValueSnapShot);
    //this.showGraph(walkingValueSnapShot);
  }

  render() {
    //console.log("rendered");
    return <div id="grid" ref={this.myRef}></div>;
  }
}

const genCurvedGraphData = (xDomain, yfunc, precision) => {
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

const returnFunc = (ind, numVar, coeff, RHS) => {
  const func = (a) => {
    if (coeff[ind - 1] === 0) return null;
    let val = RHS / coeff[ind - 1];
    for (let i = 0; i < numVar; i++)
      if (ind - 1 !== i) val += (-1 * coeff[i] * a) / coeff[ind - 1];
    return val;
  };
  return func;
};

const coordEnclosed = (yFunc, xFunc) => {
  const points = [];

  const x_lim1 = yFunc(X_DOMAIN[0]);
  const x_lim2 = yFunc(X_DOMAIN[1]);
  const y_lim1 = xFunc(Y_DOMAIN[0]);
  const y_lim2 = xFunc(Y_DOMAIN[1]);

  if (Y_DOMAIN[0] <= x_lim1 && x_lim1 <= Y_DOMAIN[1])
    points.push({ x: X_DOMAIN[0], y: x_lim1 });
  if (X_DOMAIN[0] < y_lim1 && y_lim1 < X_DOMAIN[1])
    points.push({ x: y_lim1, y: Y_DOMAIN[0] });
  if (Y_DOMAIN[0] <= x_lim2 && x_lim2 <= Y_DOMAIN[1])
    points.push({ x: X_DOMAIN[1], y: x_lim2 });
  if (X_DOMAIN[0] < y_lim2 && y_lim2 < X_DOMAIN[1])
    points.push({ x: y_lim2, y: Y_DOMAIN[1] });

  return points;
};

const genEndPoints = (coordinates, i, modelData) => {
  const endpts = coordinates.slice();
  const checkpoints = [
    { x: X_DOMAIN[0], y: Y_DOMAIN[0] },
    { x: X_DOMAIN[1], y: Y_DOMAIN[0] },
    { x: X_DOMAIN[1], y: Y_DOMAIN[1] },
    { x: X_DOMAIN[0], y: Y_DOMAIN[1] },
  ];
  const coef = modelData.constCoef[i];
  const type = modelData.constType[i];
  const RHS = modelData.constRHS[i];
  for (const pts of checkpoints) {
    const LHS = coef[0] * pts.x + coef[1] * pts.y;
    if (type === "less" && LHS <= RHS) endpts.push(pts);
    if (type === "great" && LHS >= RHS) endpts.push(pts);
  }
  //console.log(endpts);
  return endpts;
};

const reorderPts = (endPts) => {
  const endPts_copy = endPts.slice();
  const ordered = [endPts_copy.shift()];
  while (endPts_copy.length > 0) {
    const len = endPts_copy.length;
    let min_dist = -1;
    let ind = -1;
    for (let i = 0; i < len; i++) {
      const dist = Math.sqrt(
        Math.pow(ordered[ordered.length - 1].x - endPts_copy[i].x, 2) +
          Math.pow(ordered[ordered.length - 1].y - endPts_copy[i].y, 2)
      );
      if (min_dist < 0 || min_dist > dist) {
        min_dist = dist;
        ind = i;
      }
    }
    ordered.push(endPts_copy[ind]);
    endPts_copy.splice(ind, 1);
  }
  //console.log(ordered);
  return ordered;
};

const returnStringCoord = (points) => {
  return points
    .map((pt) => {
      return [X_SCALE(pt.x), Y_SCALE(pt.y)].join(",");
    })
    .join(" ");
};

const createGraphics = (svg, modelData) => {
  for (let i = 0; i < modelData.numConst; i++) {
    const gColor = d3.color(
      d3.rgb(PALLET[i])
    );
    const coordinates = coordEnclosed(
      returnFunc(
        2,
        modelData.numVar,
        modelData.constCoef[i],
        modelData.constRHS[i]
      ),
      returnFunc(
        1,
        modelData.numVar,
        modelData.constCoef[i],
        modelData.constRHS[i]
      )
    );
    //console.log(coordinates);

    createLine(svg, coordinates, i, gColor);
    if (modelData.constType[i] !== "equal")
      createIneqPolygon(svg, modelData, coordinates, i, gColor);
  }
};

const createLine = (svg, coordinates, i, gColor) => {
  svg
    .select("#equations-imported")
    .append("path")
    .attr("id", `const-${i}`)
    .attr("d", DEFAULT_LINE(coordinates))
    .attr("fill", "none")
    .attr("stroke", gColor)
    .attr("stroke-width", 3.5);
};

const createIneqPolygon = (svg, modelData, coordinates, i, gColor) => {
  const endpts = reorderPts(genEndPoints(coordinates, i, modelData));
  svg
    .select("#equations-imported")
    .append("polygon")
    .attr("id", `poly-${i}`)
    .attr("points", returnStringCoord(endpts))
    .attr("fill", gColor)
    .attr("opacity", "0.2");
};

const createDots = (svg, modelResult) => {
  if (!modelResult.problemSolved) return;
  console.log("points graphed");
  for (let i = 0; i < modelResult.iteratedSol.length; i++) {
    setTimeout(function () {
      const sol = modelResult.iteratedSol[i];
      svg
        .select("#equations-imported")
        .append("circle")
        .attr("id", `solution-${i}`)
        .attr("cx", X_SCALE(sol[0]))
        .attr("cy", Y_SCALE(sol[1]))
        .transition()
        .attr("r", SOL_RADIUS * 0.3)
        .duration(400)
        .attr("fill", d3.color(d3.rgb(0, 0, 66, 0.75)))
        .transition()
        .attr("r", SOL_RADIUS * 0.5)
        .duration(400)
        .attr("fill", d3.color(d3.rgb(17, 104, 217, 0.75)))
        .transition()
        .attr("r", SOL_RADIUS * 0.7)
        .duration(400)
        .attr("fill", d3.color(d3.rgb(0, 217, 159, 0.75)))
        .transition()
        .attr("r", SOL_RADIUS * 1.3)
        .duration(400)
        .attr("fill", d3.color(d3.rgb(0, 218, 224, 0.75)))
        .transition()
        .attr("r", SOL_RADIUS)
        .duration(400)
        .attr("fill", d3.color(d3.rgb(255, 254, 106)))
        .attr("stroke", "black")
        .attr("stroke-width", 2);
      if (i === modelResult.iteratedSol.length - 1) {
        setTimeout(function () {
          svg.select("#equations-imported").select(`#solution-${i}`).remove();
          svg
            .select("#equations-imported")
            .append("path")
            .attr("id", `solution-${i}`)
            .attr(
              "transform",
              "translate(" + X_SCALE(sol[0]) + ", " + Y_SCALE(sol[1]) + ")"
            )
            .attr("fill", d3.color(d3.rgb(255, 254, 106)))
            .attr("d", d3.symbol().size(200).type(d3.symbols[4]))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        }, 2000);
      }
    }, i * 500);
  }
};
