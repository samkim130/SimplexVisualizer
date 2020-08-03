import React, { Component } from "react";
import * as d3 from "d3"
//import "./p5Component.css";
import {
  s
} from "./sketch.js";

export default class D3Component extends Component {
    constructor(props) {
        super(props)
        this.myRef = React.createRef();
      }
    
      componentDidMount() {
        //this.myP5 = new p5(this.Sketch, this.myRef.current)
      }
    
      render() {
        return (
          <div ref={this.myRef}></div>
        )
      }
}