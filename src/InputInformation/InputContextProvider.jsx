import React, { useState, useEffect, createContext } from "react";

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
const NUMVAR = 2;
const NUMCONST = 3;

export const ModelDataContext = createContext();
export const GraphInfoContext = createContext();
export const ModelResultContext = createContext();

const InputContextProvider = ({ children }) => {
  //define useStates
  const [modelData, setModelData] = useState({
    numVar: NUMVAR,
    numConst: NUMCONST,
    obj: "maximize",
    objCoef: initObjFunc(NUMVAR),
    constCoef: initConstFunc(NUMVAR,NUMCONST),
    constType: initConstType(NUMCONST),
    constRHS: initObjFunc(NUMCONST),
  });
  const [graphInfo, setGraphInfo] = useState({
    graphReady: false, //false if
    intersections: [], //contains intersections calculated from backend
    solutionExists: true, //true unless there are no valid regions
    updateSolutionExists: null, //
  });
  const [modelResult, setModelResult] = useState({
    problemSolved: false, //
    augmentedModel: null, //
    iteratedSol: [], //
  });

  useEffect(() => {
    const triggerSolDNE=()=> {
      console.log("solution does not exist!!!!");
      setGraphInfo((g) => ({
        ...g,
        solutionExists: true,
      }));
    };
    //only called once in mounting
    setGraphInfo((g) => ({
      ...g,
      updateSolutionExists: triggerSolDNE,
    }));
    //test model data- will be omitted after everything runs smoothly
    setModelData(testDefaultMD);
  }, []);

  return (
    <ModelDataContext.Provider value={[modelData, setModelData]}>
      <GraphInfoContext.Provider value={[graphInfo, setGraphInfo]}>
        <ModelResultContext.Provider value={[modelData, setModelData]}>
          {children}
        </ModelResultContext.Provider>
      </GraphInfoContext.Provider>
    </ModelDataContext.Provider>
  );
};

export default InputContextProvider;


/**
 * initialize Objective Function Coefficients (also called by other functions since this serves a simple purpose)
 * @param {*} numVar
 */
export const initObjFunc = (numVar) => {
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
