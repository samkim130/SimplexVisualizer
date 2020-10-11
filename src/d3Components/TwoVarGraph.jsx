import React, { useState, useEffect } from "react";
import * as d3 from "d3";
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

export const TwoVarGraph=()=>{
}
