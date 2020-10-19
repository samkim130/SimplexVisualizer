import React, { useState, useEffect, useContext } from "react";
import * as d3 from "d3";
import {
  ModelDataContext,
  GraphInfoContext,
  ModelResultContext,
} from "../InputInformation/InputContextProvider.jsx";
//import "./D3Component.css";
//import { set } from "d3";
/**
 * maybe add linear algebra calculation to calculate valid points
 */
const PALLET = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];
const WIDTH = 730;
const HEIGHT = 520;
const MARGIN = { top: 10, right: 10, bottom: 30, left: 40 };
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const X_DOMAIN = [-30, 30];
const Y_DOMAIN = [-30, 30];
const X_SCALE = d3.scaleLinear().domain(X_DOMAIN).range([0, INNER_WIDTH]);
const Y_SCALE = d3.scaleLinear().domain(Y_DOMAIN).range([INNER_HEIGHT, 0]);
const DEFAULT_LINE = d3
  .line()
  .x((d) => X_SCALE(d.x))
  .y((d) => Y_SCALE(d.y));
const SOL_RADIUS = 5;
const SOL_SIZE = 200;

const TwoVarGraph = (props) => {
  const [graphData, setGraphData] = useState({
    walkingValues: [],
    svg: null,
    settings: {
      x_dom: X_DOMAIN,
      y_dom: Y_DOMAIN,
      x_scale: X_SCALE,
      y_scale: Y_SCALE,
      line: DEFAULT_LINE,
    },
  });
  const [modelData, setModelData] = useContext(ModelDataContext);
  const [graphInfo, setGraphInfo] = useContext(GraphInfoContext);
  const [modelResult, setModelResult] = useContext(ModelResultContext);

  //set up svg
  useEffect(() => {
    console.log("run once");
    const svg = d3
      .select("#grid")
      .append("svg")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .append("g")
      .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");
    setGraphData((prevGraphData) => ({
      ...prevGraphData,
      svg: svg,
    }));
  }, []);
  //updates graphData if graph is ready
  useEffect(() => {
    if (graphInfo.graphReady) {
      const domains = fetchDomains(graphInfo.intersections, modelData);
      const x_scale = d3
        .scaleLinear()
        .domain(domains.x)
        .range([0, INNER_WIDTH]);
      const y_scale = d3
        .scaleLinear()
        .domain(domains.y)
        .range([INNER_HEIGHT, 0]);
      const settings = {
        x_dom: domains.x,
        y_dom: domains.y,
        x_scale: x_scale,
        y_scale: y_scale,
        line: d3
          .line()
          .x((d) => x_scale(d.x))
          .y((d) => y_scale(d.y)),
      };
      setGraphData((prevGraphData) => ({
        ...prevGraphData,
        settings: settings,
      }));
    }
  }, [modelData, graphInfo]);
  //sets up graph
  useEffect(() => {
    console.log("graph set up - useEffect triggered");
    const { svg } = graphData;
    if (svg !== null) {
      //remove the initial graphs and then reset axis info based on
      svg.selectAll("g").remove();
      svg.selectAll("path").remove();
      svg.selectAll("text").remove();
      const { x_dom, y_dom, x_scale, y_scale, line } = graphData.settings;
      const xAxis = d3.axisBottom(x_scale).ticks(10);
      const yAxis = d3.axisLeft(y_scale).ticks(10);
      const xAxisGrid = d3
        .axisBottom(x_scale)
        .tickSize(-INNER_HEIGHT)
        .tickFormat("")
        .ticks(10);
      const yAxisGrid = d3
        .axisLeft(y_scale)
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
          line([
            { x: x_dom[0] - (x_dom[1] - x_dom[0]) / 120, y: 0 },
            { x: x_dom[1], y: 0 },
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
          line([
            { x: 0, y: y_dom[0] - (y_dom[1] - y_dom[0]) / 80 },
            { x: 0, y: y_dom[1] },
          ])
        )
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 3.5);

      svg.append("g").attr("id", "equations-imported");
    }
  },[graphData]);
  //draw graph
  useEffect(() => {
    const { modelValid } = props;
    const { svg } = graphData;
    if (graphInfo.graphReady) {
      console.log("graphed");
      svg.select("#equations-imported").selectAll("polygon").remove();
      svg.select("#equations-imported").selectAll("path").remove();
      svg.select("#equations-imported").selectAll("circle").remove();
      createGraphics();
      const solExists = graphInfo.solutionExists
        ? checkSolutionExists()
        : false;
      if (modelValid && solExists) {
        console.log("model passed");
        createDots();
      }
    }
  });

  function checkSolutionExists() {
    const checkIntersections = [];
    for (const pt of graphInfo.intersections) {
      if (pt) {
        var check = true;
        for (let i = 0; i < modelData.numConst; i++) {
          const coef = modelData.constCoef[i];
          const RHS = modelData.constRHS[i];
          const constType = modelData.constType[i];
          var LHS = 0;
          for (let j = 0; j < modelData.numVar; j++) LHS += coef[j] * pt[j];
          if (
            (LHS !== RHS && constType === "equal") ||
            (LHS > RHS && constType === "less") ||
            (LHS < RHS && constType === "great")
          ) {
            check = false;
            break;
          }
        }
        checkIntersections.push(check);
      } else {
        checkIntersections.push(false);
      }
    }
    var solutionExists = false;
    for (const check of checkIntersections) if (check) solutionExists = check;
    if (!solutionExists) {
      graphInfo.updateSolutionExists();
      return false;
    }
    return true;
  }

  /**
   * graphics creation
   * calls createLine and createIneqPolygon
   */
  function createGraphics() {
    const { settings } = graphData;
    const { numVar, constCoef, constRHS, numConst, constType } = modelData;
    for (let i = 0; i < numConst; i++) {
      const y_func = returnFunc(1, numVar, constCoef[i], constRHS[i]);
      const x_func = returnFunc(0, numVar, constCoef[i], constRHS[i]);
      const coordinates = coordEnclosed(y_func, x_func, settings);

      createLine(coordinates, i);
      if (constType[i] !== "equal") createIneqPolygon(coordinates, i);
    }
  }

  /**
   * creates line graphs for each constraint
   * @param {*} coordinates
   * @param {*} i
   */
  function createLine(coordinates, i) {
    const gColor = d3.color(d3.rgb(PALLET[i]));
    const { line } = graphData.settings;
    const { svg } = graphData;
    svg
      .select("#equations-imported")
      .append("path")
      .attr("id", `const-${i}`)
      .attr("d", line(coordinates))
      .attr("fill", "none")
      .attr("stroke", gColor)
      .attr("stroke-width", 3.5);
  }

  /**
   * creates an inequality shades for each line
   * @param {*} coordinates
   * @param {*} i
   */
  function createIneqPolygon(coordinates, i) {
    const gColor = d3.color(d3.rgb(PALLET[i]));
    const { settings, svg } = graphData;
    const endpts = reorderPts(
      genEndPoints(coordinates, i, modelData, settings)
    );
    svg
      .select("#equations-imported")
      .append("polygon")
      .attr("id", `poly-${i}`)
      .attr("points", returnStringCoord(endpts, settings))
      .attr("fill", gColor)
      .attr("opacity", "0.2");
  }

  /**
   * creates solution dots
   * @param {*} modelResult
   */
  function createDots() {
    const { x_scale, y_scale } = graphData.settings;
    const { svg } = graphData;

    if (!modelResult.problemSolved) return;
    console.log("points graphed");
    for (let i = 0; i < modelResult.iteratedSol.length; i++) {
      setTimeout(function () {
        const sol = modelResult.iteratedSol[i];
        const Z = solveObj(modelResult.augmentedModel.objCoef, sol).toFixed(2);

        const iteration = svg
          .select("#equations-imported")
          .append("circle")
          .attr("id", `solution-${i}`)
          .attr("cx", x_scale(sol[0]))
          .attr("cy", y_scale(sol[1]));

        addMouseEvents(iteration, svg, sol, i, Z);
        addTransitions(iteration);

        if (i === modelResult.iteratedSol.length - 1) {
          setTimeout(function () {
            svg.select("#equations-imported").select(`#solution-${i}`).remove();
            const solution = svg
              .select("#equations-imported")
              .append("path")
              .attr("id", `solution-${i}`)
              .attr(
                "transform",
                "translate(" + x_scale(sol[0]) + ", " + y_scale(sol[1]) + ")"
              )
              .attr("fill", d3.color(d3.rgb(255, 254, 106)))
              .attr("d", d3.symbol().size(200).type(d3.symbols[4]))
              .attr("stroke", "black")
              .attr("stroke-width", 2);
            addMouseEventsStar(solution, svg, sol, i, Z);
          }, 2000);
        }
      }, i * 500);
    }
  }

  return <div id="grid"></div>;
};

const fetchDomains = (intersections, modelData) => {
  const domains = {
    x: [0, 0],
    y: [0, 0],
  };
  for (const pt of intersections) {
    if (pt) {
      if (pt[0] < domains.x[0]) domains.x[0] = pt[0];
      if (pt[0] > domains.x[1]) domains.x[1] = pt[0];
      if (pt[1] < domains.y[0]) domains.y[0] = pt[1];
      if (pt[1] > domains.y[1]) domains.y[1] = pt[1];
    }
  }

  const { numVar, numConst, constCoef, constRHS } = modelData;
  for (let i = 0; i < numConst; i++) {
    const y_func = returnFunc(1, numVar, constCoef[i], constRHS[i]);
    const x_func = returnFunc(0, numVar, constCoef[i], constRHS[i]);
    const x_intercept = y_func(0);
    const y_intercept = x_func(0);
    if (x_intercept) {
      if (x_intercept < domains.x[0]) domains.x[0] = x_intercept;
      if (x_intercept > domains.x[1]) domains.x[1] = x_intercept;
    }
    if (y_intercept) {
      if (y_intercept < domains.y[0]) domains.y[0] = y_intercept;
      if (y_intercept > domains.y[1]) domains.y[1] = y_intercept;
    }
  }

  const xRng = domains.x[1] - domains.x[0];
  const yRng = domains.y[1] - domains.y[0];
  domains.x = [domains.x[0] - xRng * 0.3, domains.x[1] + xRng * 0.3];
  domains.y = [domains.y[0] - yRng * 0.3, domains.y[1] + yRng * 0.3];

  return domains;
};

/**
 * returns x or y function based on the constraint
 * @param {*} ind
 * @param {*} numVar
 * @param {*} coeff
 * @param {*} RHS
 */
const returnFunc = (ind, numVar, coeff, RHS) => {
  const func = (a) => {
    if (coeff[ind] === 0) return null;
    let val = RHS / coeff[ind];
    for (let i = 0; i < numVar; i++)
      if (ind !== i) val += (-1 * coeff[i] * a) / coeff[ind];
    return val;
  };
  return func;
};

/**
 *
 * @param {*} yFunc
 * @param {*} xFunc
 * @param {*} settings
 */
const coordEnclosed = (yFunc, xFunc, settings) => {
  const { x_dom, y_dom } = settings;
  const points = [];

  const x_lim1 = yFunc(x_dom[0]);
  const x_lim2 = yFunc(x_dom[1]);
  const y_lim1 = xFunc(y_dom[0]);
  const y_lim2 = xFunc(y_dom[1]);

  const pt1 = { x: x_dom[0], y: x_lim1 };
  const pt2 = { x: y_lim1, y: y_dom[0] };
  const pt3 = { x: x_dom[1], y: x_lim2 };
  const pt4 = { x: y_lim2, y: y_dom[1] };
  //console.log("generated points", pt1, pt2, pt3, pt4);

  const plotted = [];
  if (x_lim1 !== null && y_dom[0] <= x_lim1 && x_lim1 <= y_dom[1]) {
    //plotted.push(pt1);
    points.push(pt1);
  }
  if (y_lim1 !== null && y_dom[0] < y_lim1 && y_lim1 < x_dom[1]) {
    //plotted.push(pt2);
    points.push(pt2);
  }
  if (x_lim2 !== null && y_dom[0] <= x_lim2 && x_lim2 <= y_dom[1]) {
    //plotted.push(pt3);
    points.push(pt3);
  }
  if (y_lim2 !== null && x_dom[0] < y_lim2 && y_lim2 < x_dom[1]) {
    //plotted.push(pt4);
    points.push(pt4);
  }
  //console.log("plotted points", plotted);

  return points;
};

const genEndPoints = (coordinates, i, modelData, settings) => {
  const { x_dom, y_dom } = settings;
  const endpts = coordinates.slice();
  const checkpoints = [
    { x: x_dom[0], y: y_dom[0] },
    { x: x_dom[1], y: y_dom[0] },
    { x: x_dom[1], y: y_dom[1] },
    { x: x_dom[0], y: y_dom[1] },
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
  const ordered = endPts_copy.splice(0, 2);
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

const returnStringCoord = (points, settings) => {
  const { x_scale, y_scale } = settings;
  return points
    .map((pt) => {
      return [x_scale(pt.x), y_scale(pt.y)].join(",");
    })
    .join(" ");
};

const solveObj = (coeff, sol) => {
  var Z = 0;
  for (let i = 0; i < 2; i++) Z += sol[i] * coeff[i];
  return Z;
};

const addMouseEvents = (this_svg, grid_svg, sol, i, Z) => {
  this_svg.on("mouseover", function () {
    const this_x = Number(d3.select(this).attr("cx")).toFixed(2);
    const this_y = Number(d3.select(this).attr("cy")).toFixed(2);
    const txt =
      "( " + sol[0].toFixed(2) + ", " + sol[1].toFixed(2) + " )\n" + Z;

    d3.select(this).attr("r", SOL_RADIUS * 2);

    grid_svg
      .select("#equations-imported")
      .append("text")
      .attr("id", `txt-${i}`)
      .attr("x", this_x + 20)
      .attr("y", this_y - 15)
      .text(txt);
  });
  this_svg.on("mouseout", function () {
    d3.select(this).attr("r", SOL_RADIUS);

    grid_svg.select("#equations-imported").select(`#txt-${i}`).remove();
  });
};

const addTransitions = (this_svg) => {
  this_svg
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
};

const addMouseEventsStar = (this_svg, grid_svg, sol, i, Z) => {
  this_svg.on("mouseover", function () {
    const pos = String(d3.select(this).attr("transform"));
    const this_x = Number(
      pos.substring(pos.indexOf("(") + 1, pos.indexOf(","))
    ).toFixed(2);
    const this_y = Number(
      pos.substring(pos.indexOf(",") + 1, pos.indexOf(")"))
    ).toFixed(2);
    console.log(pos, this_x, this_y);
    const txt =
      "( " + sol[0].toFixed(2) + ", " + sol[1].toFixed(2) + " )\n" + Z;

    d3.select(this).attr(
      "d",
      d3
        .symbol()
        .size(SOL_SIZE * 1.75)
        .type(d3.symbols[4])
    );

    grid_svg
      .select("#equations-imported")
      .append("text")
      .attr("id", `txt-${i}`)
      .attr("x", this_x + 20)
      .attr("y", this_y - 15)
      .text(txt);
  });
  this_svg.on("mouseout", function () {
    d3.select(this).attr("d", d3.symbol().size(SOL_SIZE).type(d3.symbols[4]));

    grid_svg.select("#equations-imported").select(`#txt-${i}`).remove();
  });
};

export default TwoVarGraph;
