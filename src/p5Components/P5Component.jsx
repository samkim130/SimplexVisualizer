import React, { Component } from "react";
import p5 from "p5"
//import "./p5Component.css";
import {
  s
} from "./sketch.js";

export default class P5Component extends Component {
    constructor(props) {
        super(props)
        this.myRef = React.createRef();
        this.Sketch = s;
      }
    
      componentDidMount() {
        this.myP5 = new p5(this.Sketch, this.myRef.current)
      }
    
      render() {
        return (
          <div ref={this.myRef}>
    
          </div>
        )
      }
}