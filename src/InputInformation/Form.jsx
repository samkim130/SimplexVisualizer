import React, {useContext} from "react";
import {InputContext} from "./InputContext.jsx";

/**
 *
 * @param {*} objCoef
 * @param {*} numVar
 * @param {*} handleNumberChange
 */
export const ObjFunc = (props) => {
  const { objCoef, numVar, handleNumberChange } = props;

  return (
    <div>
      {objCoef.map((coeff, i) => {
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
      })}
    </div>
  );
};

/**
 *
 * @param {*} constCoef
 * @param {*} constRHS
 * @param {*} numConst
 * @param {*} numVar
 * @param {*} handleNumberChange
 */
const ConstraintLHS = (props) => {
  const {
    constArray,
    constType,
    constRHS,
    numVar,
    handleNumberChange,
    handleConstTypeChange,
  } = props;

  return constArray.map((coeff, i) => {
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
  });
};

export const ConstFunc=(props)=>{
    return constCoef.map((constArray, j) => {
        return (
          <div key={`constraint-${j}`}>
            <ConstraintLHS></ConstraintLHS>
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

