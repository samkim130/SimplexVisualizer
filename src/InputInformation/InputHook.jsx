import React, { useState, useEffect, useContext } from "react";
import D3Component from "../d3Components/D3Component.jsx";
import TwoVarGraph from "../d3Components/TwoVarGraph.jsx";
import "./EquationInput.css";
import { ObjFunc, ConstFunc } from "./Form.jsx";
import {
  ModelDataContext,
  GraphInfoContext,
  ModelResultContext,
  initObjFunc,
} from "./InputContextProvider.jsx";

export const EquationInputFunction = () => {
  //define useStates
  const [modelData, setModelData] = useContext(ModelDataContext);
  const [graphInfo, setGraphInfo] = useContext(GraphInfoContext);
  const [modelResult, setModelResult] = useContext(ModelResultContext);
  const [modelValid, setModelValidity] = useState(false);

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
    constRHS.push("");

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
    constType[index - 1] = e.target.value;

    setModelData({
      ...modelData,
      constType: constType,
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
          <ObjFunc handleCoeffChange={handleCoeffChange} />
        </div>
        <div className="constraints">
          Constraints :<br></br>
          <ConstFunc
            handleCoeffChange={handleCoeffChange}
            handleConstTypeChange={handleConstTypeChange}
          />
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
              <button className="btn btn-primary" onClick={solveModel}>
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
        <TwoVarGraph modelValid={modelValid}/>
      </div>
    </div>
  );
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
