import React, { useState, useEffect } from "react";
//import ... from "../d3Components/TwoVarGraph.jsx";
import "./EquationInput.css";

const defaultObjC = [5, 4];
const defaultConstC = [
  [2, 1],
  [1, 1],
  [1, 2],
];
const defaultConstType = ["less", "less", "great"];
const defaultConstRHS = [20, 18, 12];
const testDefaultMD = {
  numVar: 2,
  numConst: 3,
  obj: "maximize",
  objCoef: defaultObjC,
  constCoef: defaultConstC,
  constType: defaultConstType,
  constRHS: defaultConstRHS,
};
//not used yet
const NUMVAR = 2;
const NUMCONST = 3;

export const EquationInput=()=>{
  //define useStates
  const [modelData, setModelData] = useState(testDefaultMD);
  /*
  const [modelData, setModelData] = useState({
    numVar: NUMVAR,
    numConst: NUMCONST,
    obj: "maximize",
    objCoef: initObjFunc(NUMVAR),
    constCoef: initConstFunc(NUMVAR,NUMCONST),
    constType: initConstType(NUMCONST),
    constRHS: initObjFunc(NUMCONST),
  });
   
   */
  const [graphInfo, setGraphInfo] = useState({
    graphReady: false, //false if
    intersections: [], //contains intersections calculated from backend
    solutionExists: true, //true unless there are no valid regions
    updateSolutionExists: triggerSolDNE(), //
  });
  const [modelValid, setModelValidity] = useState(false);
  const [modelResult, setModelResult] = useState({
    problemSolved: false, //
    augmentedModel: null, //
    iteratedSol: [], //
  });

  //define useEffects
  useEffect(() => {});

  /* change Model State *********************************************/
  function addVar() {
    const { numVar, objCoef, constCoef } = modelData;
    if (numVar === 2) {
      console.log("max number of variables reached!");
      return;
    }
    //make changes
    objCoef.push(0);
    constCoef.forEach((row) => row.push(0));
    //set States
    setModelData({
      ...modelData,
      numVar: numVar + 1,
    });
    resetGraph();
  }
  function removeVar() {
    const { numVar, objCoef, constCoef } = modelData;
    if (numVar === 1) {
      console.log("var cannot drop below 1!");
      return;
    }
    objCoef.pop();
    constCoef.forEach((row) => row.pop());
    //set States
    setModelData({
      ...modelData,
      numVar: numVar - 1,
    });
    resetGraph();
  }
  function addConst() {
    const { numVar, numConst, constCoef, constType, constRHS } = modelData;
    if (numConst > 99) {
      console.log("max number of constraints reached!");
      return;
    }
    //make changes
    constCoef.push(initObjFunc(numVar));
    constType.push("less");
    constRHS.push(0);

    //set States
    setModelData({
      ...modelData,
      numConst: numConst + 1,
    });
    resetGraph();
  }
  function removeConst() {
    const { numConst, constCoef, constType, constRHS } = modelData;
    if (numConst === 1) {
      console.log("constraints cannot drop below 1!");
      return;
    }
    constCoef.pop();
    constType.pop();
    constRHS.pop();

    //set States
    setModelData({
      ...modelData,
      numConst: numConst - 1,
    });
    resetGraph();
  }
  function handleObjTypeChange(e) {
    console.log("changed this", e.target.id);
    setModelData({
      ...modelData,
      obj: e.target.value,
    });
    resetGraph();
  }
  function handleCoeffChange(e) {
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
    //const modelData = { ...this.state.modelData };

    if (id.includes("rhs")) {
      const { constRHS } = modelData;
      const index = parseInt(id.substring(first + 1));

      constRHS[index - 1] = newCoef;
    } else if (id.includes("xc")) {
      const { constCoef } = modelData;
      const second = id.indexOf("-", first + 1);
      const i_index = parseInt(id.substring(first + 1, second));
      const j_index = parseInt(id.substring(second + 1));

      constCoef[j_index - 1][i_index - 1] = newCoef;
    } else {
      const { objCoef } = modelData;
      const index = parseInt(id.substring(first + 1));

      objCoef[index - 1] = newCoef;
    }

    setModelData({
      ...modelData,
    });
    resetGraph();
  }
  function handleConstTypeChange(e) {
    const { constType } = modelData;
    const index = parseInt(e.target.id.substring(6));
    constType[index - 1] = Number(e.target.value);

    setModelData({
      ...modelData,
    });
    resetGraph();

    console.log("changed constraint type:", e.target.id, e.target.value);
  }
  function resetGraph() {
    setGraphInfo({
      ...graphInfo,
      graphReady: false,
      intersections: [],
      solutionExists: true,
    });
    setModelValidity(false);
  }
  //this is going to cause an issue
  function triggerSolDNE() {
    console.log("solution does not exist!!!!");
    setGraphInfo({
      ...graphInfo,
      solutionExists: false,
    });
  }
  /******************************************************************/

  /** Graph Models **************************************************/
  async function graphModel() {
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

      setGraphInfo({
        ...graphInfo,
        graphReady: true,
        intersections: json.intersections,
        solutionExists: true,
      });
    } else {
      console.log("HTTP-Error: " + response.status);
      setGraphInfo({
        ...graphInfo,
        graphReady: false,
        intersections: [],
        solutionExists: true,
      });
    }
  }

  async function solveModel() {
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

      setModelResult({
        ...modelResult,
        problemSolved: json.solution.problemSolved,
        augmentedModel: augmentedModel,
        iteratedSol: json.solution.iteratedSol,
      });
      setModelValidity(true);
    } else {
      console.log("HTTP-Error: " + response.status);
      setModelValidity(false);
    }
  }
  /******************************************************************/

  //to do here
  return (
    <div className="simplex">
      <div className="top">
        <div className="objective-function">
          <select
            name="optimization"
            id="optType"
            value={modelData.obj}
            onChange={handleObjTypeChange}
          >
            <option value="maximize">Max</option>
            <option value="minimize">Min</option>
          </select>
          {` :  `}
          {objFunc(modelData.objCoef, modelData.numVar, handleCoeffChange)}
        </div>
        <div className="constraints">
          Constraints :<br></br>
          {constraints(
            modelData.constCoef,
            modelData.constType,
            modelData.constRHS,
            modelData.numVar,
            handleCoeffChange,
            handleConstTypeChange
          )}
        </div>
        <br></br>
        <label>Change Number of Constraints: </label>
        <button className="btn btn-primary" onClick={addConst}>
          add(+)
        </button>
        {` `}
        <button className="btn btn-primary" onClick={removeConst}>
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
                onClick={solveModel}
              >
                Solve
              </button>
            )
          ) : (
            "Solution Does Not Exist"
          )
        ) : (
          <button className="btn btn-primary" onClick={graphModel}>
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

/**
 * initialize Objective Function Coefficients (also called by other functions since this serves a simple purpose)
 * @param {*} numVar
 */
const initObjFunc = (numVar) => {
  const coeffs = [];
  for (let i = 0; i < numVar; i++) coeffs.push("");
  return coeffs;
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
