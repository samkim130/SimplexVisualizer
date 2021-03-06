import React, { Component } from "react";
import D3Component from "../d3Components/D3Component.jsx";
import "./EquationInput.css";

const defaultObjC = [5, 4];
const defaultConstC = [
  [2, 1],
  [1, 1],
  [1, 2],
];
const defaultConstType = ["less", "less", "great"];
const defaultConstRHS = [20, 18, 12];

export default class EquationInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modelData: {
        numVar: 2,
        numConst: 3,
        obj: "maximize",
        objCoef: [],
        constCoef: [],
        constType: [],
        constRHS: [],
      },
      graphInfo: {
        graphReady: false,
        intersections: [],
        solutionExists: true,
        updateSolutionExists: null,
      },
      modelValid: false,
      modelResult: {
        problemSolved: false,
        augmentedModel: null,
        iteratedSol: [],
      },
    };
  }

  /************************************************/
  addVar() {
    const { numVar, objCoef, constCoef } = this.state.modelData;
    if (numVar === 2) {
      console.log("max number of variables reached!");
      return;
    }
    objCoef.push(0);
    constCoef.forEach((row) => row.push(0));
    this.setState({
      modelData: {
        ...this.state.modelData,
        numVar: numVar + 1,
      },
      modelValid: false,
      graphInfo: {
        ...this.state.graphInfo,
        graphReady: false,
        intersections: [],
        solutionExists: true,
      },
    });
  }
  removeVar() {
    const { numVar, objCoef, constCoef } = this.state.modelData;
    if (numVar === 1) {
      console.log("var cannot drop below 1!");
      return;
    }
    objCoef.pop();
    constCoef.forEach((row) => row.pop());
    this.setState({
      modelData: {
        ...this.state.modelData,
        numVar: numVar - 1,
      },
      modelValid: false,
      graphInfo: {
        ...this.state.graphInfo,
        graphReady: false,
        intersections: [],
        solutionExists: true,
      },
    });
  }
  addConst() {
    const {
      numVar,
      numConst,
      constCoef,
      constType,
      constRHS,
    } = this.state.modelData;
    if (numConst > 99) {
      console.log("max number of constraints reached!");
      return;
    }
    constCoef.push(initObjFunc(numVar));
    constType.push("less");
    constRHS.push(0);
    this.setState({
      modelData: {
        ...this.state.modelData,
        numConst: numConst + 1,
      },
      modelValid: false,
      graphInfo: {
        ...this.state.graphInfo,
        graphReady: false,
        intersections: [],
        solutionExists: true,
      },
    });
  }
  removeConst() {
    const { numConst, constCoef, constType, constRHS } = this.state.modelData;
    if (numConst === 1) {
      console.log("constraints cannot drop below 1!");
      return;
    }
    constCoef.pop();
    constType.pop();
    constRHS.pop();
    this.setState({
      modelData: {
        ...this.state.modelData,
        numConst: numConst - 1,
      },
      modelValid: false,
      graphInfo: {
        ...this.state.graphInfo,
        graphReady: false,
        intersections: [],
        solutionExists: true,
      },
    });
  }
  /************************************************/
  handleObjTypeChange = (e) => {
    console.log("changed this", e.target.id);
    this.setState({
      modelData: {
        ...this.state.modelData,
        obj: e.target.value,
      },
      modelValid: false,
      graphInfo: {
        ...this.state.graphInfo,
        graphReady: false,
        intersections: [],
        solutionExists: true,
      },
    });
  };

  handleNumberChange = (e) => {
    if (
      isNaN(e.target.value) &&
      e.target.value !== undefined &&
      e.target.value !== ""
    ) {
      alert("non-numbers unallowed");
      console.log("non-numbers unallowed");
      e.preventDefault();
      return;
    }
    const newCoef = Number(e.target.value);
    const id = e.target.id;
    const first = id.indexOf("-", 0);
    const modelData = { ...this.state.modelData };

    if (id.includes("rhs")) {
      const { constRHS } = this.state.modelData;
      const index = parseInt(id.substring(first + 1));

      constRHS[index - 1] = newCoef;
      modelData.constRHS = constRHS;
    } else if (id.includes("xc")) {
      const { constCoef } = this.state.modelData;
      const second = id.indexOf("-", first + 1);
      const i_index = parseInt(id.substring(first + 1, second));
      const j_index = parseInt(id.substring(second + 1));

      constCoef[j_index - 1][i_index - 1] = newCoef;
      modelData.constCoef = constCoef;
    } else {
      const { objCoef } = this.state.modelData;
      const index = parseInt(id.substring(first + 1));

      objCoef[index - 1] = newCoef;
      modelData.objCoef = objCoef;
    }

    this.setState({
      modelData: modelData,
      modelValid: false,
      graphInfo: {
        ...this.state.graphInfo,
        graphReady: false,
        intersections: [],
        solutionExists: true,
      },
    });

    console.log("changed number: ", id, e.target.value);
  };

  handleConstTypeChange = (e) => {
    const { constType } = this.state.modelData;
    const index = parseInt(e.target.id.substring(6));
    constType[index - 1] = Number(e.target.value);
    this.setState({
      modelData: {
        ...this.state.modelData,
      },
      modelValid: false,
      graphInfo: {
        ...this.state.graphInfo,
        graphReady: false,
        intersections: [],
        solutionExists: true,
      },
    });
    console.log("changed constraint type:", e.target.id, e.target.value);
  };
  /************************************************/

  async graphModel() {
    const { modelData } = this.state;

    let response = await fetch("/graph", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        modelData: modelData,
      }),
    });
    if (response.ok) {
      let json = await response.json();

      console.log("msg:", json.msg);
      console.log(json.summary);
      console.log(json.intersections);

      this.setState({
        graphInfo: {
          ...this.state.graphInfo,
          graphReady: true,
          intersections: json.intersections,
          solutionExists: true,
        },
      });
    } else {
      console.log("HTTP-Error: " + response.status);
      this.setState({
        graphInfo: {
          ...this.state.graphInfo,
          graphReady: false,
          intersections: [],
          solutionExists: true,
        },
      });
    }
  }

  async solveModel() {
    const { modelData, modelResult } = this.state;
    const augmentedModel = augmentModel(modelData);
    console.log(augmentedModel);
    console.log(modelData);

    let response = await fetch("/solution", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        augmentedModel: augmentedModel,
      }),
    });
    if (response.ok) {
      let json = await response.json();

      console.log("msg:", json.msg);
      console.log(json.augmented_form);
      console.log(json.solution);

      const { problemSolved, iteratedSol } = json.solution;
      modelResult.problemSolved = problemSolved;
      modelResult.augmentedModel = augmentedModel;
      modelResult.iteratedSol = iteratedSol;

      this.setState({
        modelValid: true,
        modelResult: modelResult,
      });
    } else {
      console.log("HTTP-Error: " + response.status);
      this.setState({ modelValid: false, modelResult: modelResult });
    }
  }

  /************************************************/
  componentDidMount() {
    //this is a temporary test set up
    this.setState({
      modelData: {
        ...this.state.modelData,
        objCoef: defaultObjC,
        constCoef: defaultConstC,
        constType: defaultConstType,
        constRHS: defaultConstRHS,
      },
      graphInfo: {
        ...this.state.graphInfo,
        updateSolutionExists: this.triggerSolDNE.bind(this),
      },
    });
    /*
    const { numVar, numConst } = this.state.modelData;
    const objCoef = initObjFunc(numVar);
    const constRHS = initObjFunc(numConst);
    const constType = initConstType(numConst);
    const constCoef = initConstFunc(numVar, numConst);
    this.setState({
      modelData: {
        ...this.state.modelData,
        objCoef: objCoef,
        constCoef: constCoef,
        constType: constType,
        constRHS: constRHS,
      },
    });
    */
  }

  triggerSolDNE() {
    const { graphInfo } = this.state;
    console.log("solution does not exist!!!!");
    this.setState({
      graphInfo: {
        ...graphInfo,
        solutionExists: false,
      },
    });
  }

  componentDidUpdate() {}
  /************************************************/
  render() {
    const { modelData, modelValid, modelResult, graphInfo } = this.state;
    const { numVar, obj, objCoef, constCoef, constType, constRHS } = modelData;

    return (
      <div className="simplex">
        <div className="top">
          <div className="objective-function">
            <select
              name="optimization"
              id="optType"
              value={obj}
              onChange={this.handleObjTypeChange.bind(this)}
            >
              <option value="maximize">Max</option>
              <option value="minimize">Min</option>
            </select>
            {` :  `}
            {objFunc(objCoef, numVar, this.handleNumberChange.bind(this))}
          </div>
          <div className="constraints">
            Constraints :<br></br>
            {constraints(
              constCoef,
              constType,
              constRHS,
              numVar,
              this.handleNumberChange.bind(this),
              this.handleConstTypeChange.bind(this)
            )}
          </div>
          <br></br>
          <label>Change Number of Constraints: </label>
          <button className="btn btn-primary" onClick={() => this.addConst()}>
            add(+)
          </button>
          {` `}
          <button
            className="btn btn-primary"
            onClick={() => this.removeConst()}
          >
            remove(-)
          </button>
          <br />
          <br />
          {graphInfo.graphReady ? (
            graphInfo.solutionExists ? (
              modelValid ? (
                ""
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => this.solveModel()}
                >
                  Solve
                </button>
              )
            ) : (
              "Solution Does Not Exist"
            )
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => this.graphModel()}
            >
              Graph
            </button>
          )}
        </div>
        <div className="bottom">
          {graphInfo.graphReady ? (
            modelValid && graphInfo.solutionExists ? (
              <D3Component
                graphInfo={graphInfo}
                modelValid={modelValid}
                modelData={modelData}
                modelResult={modelResult}
              ></D3Component>
            ) : (
              <D3Component
                graphInfo={graphInfo}
                modelValid={modelValid}
                modelData={modelData}
              ></D3Component>
            )
          ) : (
            <D3Component
              graphInfo={graphInfo}
              modelValid={modelValid}
            ></D3Component>
          )}
        </div>
      </div>
    );
  }
}

/**
 * initialize Objective Function Coefficients (also called by other functions since this serves a simple purpose)
 * @param {*} numVar
 */
const initObjFunc = (numVar) => {
  const objC = [];
  for (let i = 0; i < numVar; i++) objC.push("");
  return objC;
};

/**
 * initialize Constraint Function Coefficients
 * @param {*} numVar
 */
const initConstFunc = (numVar, numConst) => {
  const constC = [];
  for (let j = 0; j < numConst; j++) constC.push(initObjFunc(numVar));
  return constC;
};

/**
 * initialize Constraint Function Types
 * less than equal to is "less"
 * equal to is "equal"
 * greater than equal to is "great"
 * @param {*} numVar
 */
const initConstType = (numConst) => {
  const constT = [];
  for (let j = 0; j < numConst; j++) constT.push("less");
  return constT;
};

/**
 *
 * @param {*} objCoef
 * @param {*} numVar
 * @param {*} handleNumberChange
 */
const objFunc = (objCoef, numVar, handleNumberChange) => {
  return objCoef.map((coeff, i) => {
    const objOut = [];
    objOut.push(
      <input
        key={`input-x-${i + 1}`}
        type="text"
        id={`x-${i + 1}`}
        value={coeff}
        onChange={handleNumberChange}
      />
    );
    objOut.push(
      <label key={`label-x-${i + 1}`} htmlFor={`x-${i + 1}`}>
        {` * `}
        <b>x{i + 1} </b>
      </label>
    );
    if (i + 1 < numVar) objOut.push("+ ");
    return objOut;
  });
};

/**
 *
 * @param {*} constCoef
 * @param {*} constRHS
 * @param {*} numConst
 * @param {*} numVar
 * @param {*} handleNumberChange
 */
const constraints = (
  constCoef,
  constType,
  constRHS,
  numVar,
  handleNumberChange,
  handleConstTypeChange
) => {
  return constCoef.map((constArray, j) => {
    return (
      <div key={`constraint-${j}`}>
        {constArray.map((coeff, i) => {
          const varOut = [];
          varOut.push(
            <input
              key={`input-xc-${i + 1}-${j + 1}`}
              type="text"
              id={`xc-${i + 1}-${j + 1}`}
              value={coeff}
              onChange={handleNumberChange}
            />
          );
          varOut.push(
            <label
              key={`label-xc-${i + 1}-${j + 1}`}
              htmlFor={`xc-${i + 1}-${j + 1}`}
            >
              {` * `}
              <b>x{i + 1} </b>
            </label>
          );
          if (i + 1 < numVar) varOut.push("+ ");
          return varOut;
        })}
        <select
          name={`ctype-${j + 1}`}
          id={`ctype-${j + 1}`}
          value={constType[j]}
          onChange={handleConstTypeChange}
        >
          <option value="less">{`<=`}</option>
          <option value="equal">{`=`}</option>
          <option value="great">{`>=`}</option>
        </select>{" "}
        <input
          key={`input-rhs-${j + 1}`}
          type="text"
          id={`rhs-${j + 1}`}
          value={constRHS[j]}
          onChange={handleNumberChange}
        />
      </div>
    );
  });
};

/**
 *
 * @param {*} modelData
 */
const augmentModel = (modelData) => {
  const augmentedModel = JSON.parse(JSON.stringify(modelData));
  let { numVar } = augmentedModel;
  const { obj, numConst, objCoef, constCoef, constType } = augmentedModel;

  if (obj === "minimize")
    for (let i = 0; i < numVar; i++) objCoef[i] = -1 * objCoef[i];
  const M = 9999;
  const realVar = [];
  for (let i = 0; i < numVar; i++) realVar.push(1);

  for (let i = 0; i < numConst; i++) {
    numVar = numVar + 1;
    objCoef.push(0);
    realVar.push(0);
    constCoef.forEach((row) => row.push(0));
    switch (constType[i]) {
      case "great":
        constType[i] = "equal";
        constCoef[i][numVar - 1] = -1;
        //need to add one more var
        numVar = numVar + 1;
        objCoef.push(0);
        realVar.push(0);
        constCoef.forEach((row) => row.push(0));
        constCoef[i][numVar - 1] = 1;
        objCoef[numVar - 1] = -1 * M;
        break;
      case "equal":
        constCoef[i][numVar - 1] = 1;
        objCoef[numVar - 1] = -1 * M;
        break;
      default:
        constType[i] = "equal";
        constCoef[i][numVar - 1] = 1;
    }
  }
  return {
    ...augmentedModel,
    numVar: numVar,
    numConst: numConst,
    realVar: realVar,
  };
};
