/*
tutorial bar chart
https://blog.logrocket.com/data-visualization-in-react-using-react-d3-c35835af16d0/
*/
import React, { Component } from "react";
import * as d3 from "d3";

export default class BarChart extends Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
      }
  drawChart() {
    const data = this.props.data;
    /**
     * The d3.select() is used to select an HTML element from the document. It selects the first element that matches the argument passed and creates a node for it.
     * In this case, we passed the body element, which we will change later to make the component more reusable.
     * The append() method appends an HTML node to the selected item and returns a handle to that node.
     * The attr method is used to add attributes to the element. This can be any attribute that you will normally add to the HTML element like class, height, width or fill .
     * We then appended an SVG element to the body element with a width: 700 and height: 300.
     */
    const svg = d3
      .select(this.myRef.current)
      .append("svg")
      .attr("width", this.props.width)
      .attr("height", this.props.height)
      .style("margin-left", 100);

    /**
     * Just like the select method, selectAll() selects the element that matches the argument that is passed to it. So, all elements that match the arguments are selected and not just the first.
     * Next, the data() method, is used to attach the data passed as an argument to the selected HTML elements.
     * Most times, these elements are not found because most visualization deal with dynamic data and it is nearly impossible to estimate the amount of data that will be represented.
     * The enter() method rescues us from that bottleneck as it is used alongside the append method to create the nodes that are missing and still visualize the data.
     * So far we have created nodes for each data point. All that’s left is to make it visible.
     * To make it visible we need to create a bar for each of those datasets, set a width and update the height of each bar dynamically.
     * The attr method allows us to use a callback function to deal with the dynamic data:
     *         selection.attr("property", (d, i) => {})
     * Where d is the data point value and i is the index of the data point of the array.
     */
    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * 70)
      .attr("y", (d, i) => this.props.height - 10 * d)
      .attr("width", 65)
      .attr("height", (d, i) => d * 10)
      .attr("fill", "green");

    svg
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .text((d) => d)
      .attr("x", (d, i) => i * 70)
      .attr("y", (d, i) => this.props.height - 10 * d - 3);
  }
  componentDidMount() {
    this.drawChart();
  }
  render() {
    return <div ref={this.myRef}></div>;
  }
}
