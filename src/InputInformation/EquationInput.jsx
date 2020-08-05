import React, { Component } from "react";
import D3Component from "../d3Components/D3Component.jsx";
import "./EquationInput.css";

const YFUNCTION = (x) => Math.log(1) + Math.log(x);

export default class EquationInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numVar: 2,
      numConst: 3,
      objRefs: [],
      constRefs: [],
      obj:"maximize",
      objCoef: [5, 4],
      constCoef: [
        [2, 1],
        [1, 1],
        [1, 2],
      ],
      constRHS: [20, 18, 12],
    };
  }

  addVar() {
    const { numVar, objRefs, constRefs } = this.state;
    if (numVar > 3) {
      console.log("max number of variables reached!");
      return;
    }
    objRefs.push(React.createRef());
    constRefs.forEach((row) => row.splice(numVar - 1, 0, React.createRef()));
    this.setState({
      numVar: numVar + 1,
      objRefs: objRefs,
      constRefs: constRefs,
    });
  }
  removeVar() {
    const { numVar, objRefs, constRefs } = this.state;
    if (numVar === 1) {
      console.log("var cannot drop below 1!");
      return;
    }
    objRefs.pop();
    constRefs.forEach((row) => row.splice(numVar - 2, 1));
    this.setState({
      numVar: numVar - 1,
      objRefs: objRefs,
      constRefs: constRefs,
    });
  }
  addConst() {
    const { numVar, numConst, constRefs } = this.state;
    if (numConst > 99) {
      console.log("max number of constraints reached!");
      return;
    }
    constRefs.push(initializeObjRef(numVar + 1));
    this.setState({
      numConst: numConst + 1,
      constRefs: constRefs,
    });
  }
  removeConst() {
    const { numConst, constRefs } = this.state;
    if (numConst === 1) {
      console.log("constraints cannot drop below 1!");
      return;
    }
    constRefs.pop();
    this.setState({
      numConst: numConst - 1,
      constRefs: constRefs,
    });
  }
  handleOptimization = (e) => {
    this.setState({
        obj:e.target.value,
    })
  };

  submitModel(e) {
    e.preventDefault();
    //displayWarning("Please input numbers only.");
  }

  componentDidMount() {
    const { numVar, numConst } = this.state;
    const objRefs = initializeObjRef(numVar);
    const constRefs = initializeConstRef(numVar, numConst);
    this.setState({
      objRefs: objRefs,
      constRefs: constRefs,
    });
  }

  componentDidUpdate() {}

  render() {
    const { numVar, numConst, objRefs, constRefs } = this.state;

    return (
      <div className="simplex">
        <div className="split left">
          <select
            name="optimization"
            id="optType"
            value={this.state.obj}
            onChange={this.handleOptimization}
          >
            <option value="maximize">Max</option>
            <option value="minimize">Min</option>
          </select>
          {` :  `}
          {objFunc(objRefs, numVar)}
          <br></br>Constraints :<br></br>
          {constraints(constRefs, numConst, numVar)}
          <br></br>
          <label>Change Number of Variables: </label>
          <button onClick={() => this.addVar()}>add(+)</button>
          {` `}
          <button onClick={() => this.removeVar()}>remove(-)</button>
          <br></br>
          <label>Change Number of Constraints: </label>
          <button onClick={() => this.addConst()}>add(+)</button>
          {` `}
          <button onClick={() => this.removeConst()}>remove(-)</button>
          <br />
          <br />
          <button onClick={() => this.submitModel()}>submit</button>
        </div>
        <div className="split right">
          <D3Component yfunc={(x) => YFUNCTION(x)}></D3Component>
        </div>
      </div>
    );
  }
}

const initializeObjRef = (numVar) => {
  const objRef = [];
  for (let i = 0; i < numVar; i++) {
    objRef.push(React.createRef());
  }
  return objRef;
};
const initializeConstRef = (numVar, numConst) => {
  const constRef = [];
  for (let j = 0; j < numConst; j++) {
    constRef.push(initializeObjRef(numVar + 1));
  }
  return constRef;
};
const objFunc = (objRefs, numVar) => {
  return objRefs.map((varRef, i) => {
    const objOut = [];
    objOut.push(<input type="text" key={`xvar${i + 1}`} id={`xvar${i + 1}`} ref={varRef} />);
    objOut.push(
      <label htmlFor={`xvar${i + 1}`}>
        {` * `}
        <b>x{i + 1} </b>
      </label>
    );
    if (i + 1 < numVar) objOut.push("+ ");
    return objOut;
  });
};
const constraints = (constRefs, numConst, numVar) => {
  return constRefs.map((constArray, j) => {
    const constOut = constArray.map((varRef, i) => {
      if (numVar === i) return null;
      const varOut = [];
      varOut.push(
        <input type="text" key={`xvar${i + 1}-const${j + 1}`} id={`xvar${i + 1}-const${j + 1}`} ref={varRef} />
      );
      varOut.push(
        <label htmlFor={`xvar${i + 1}-const${j + 1}`}>
          {` * `}
          <b>x{i + 1} </b>
        </label>
      );
      if (i + 1 < numVar) varOut.push("+ ");
      return varOut;
    });

    constOut.push(
      <select
        name={`constraint-${j + 1}`}
        id={`const${j + 1}`}
        ref={constArray[numVar]}
      >
        <option value={`less${j + 1}`}>{`<=`}</option>
        <option value={`equal${j + 1}`}>{`=`}</option>
        <option value={`great${j + 1}`}>{`>=`}</option>
      </select>
    );
    constOut.push(" ");
    constOut.push(<input type="text" id={`const${j + 1}-rhs`} />);
    constOut.push(<br></br>);

    return constOut;
  });
};
