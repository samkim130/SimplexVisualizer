import React, { useContext } from "react";
import { ModelDataContext } from "./InputContextProvider.jsx";

/**
 *
 * @param {*} handleNumberChange
 */
export const ObjFunc = ({ handleCoeffChange }) => {
  const [modelData, setModelData] = useContext(ModelDataContext);
  return (
    <div>
      {modelData.objCoef.map((coeff, i) => {
        const objOut = [];
        objOut.push(
          <input
            key={`input-x-${i + 1}`}
            type="text"
            id={`x-${i + 1}`}
            value={coeff}
            onChange={handleCoeffChange}
          />
        );
        objOut.push(
          <label key={`label-x-${i + 1}`} htmlFor={`x-${i + 1}`}>
            {` * `}
            <b>x{i + 1} </b>
          </label>
        );
        if (i + 1 < modelData.numVar) objOut.push("+ ");
        return objOut;
      })}
    </div>
  );
};

const ConstraintLHS = ({ constArray, numVar, j, handleCoeffChange }) => {
  return constArray.map((coeff, i) => {
    const varOut = [];
    varOut.push(
      <input
        key={`input-xc-${i + 1}-${j + 1}`}
        type="text"
        id={`xc-${i + 1}-${j + 1}`}
        value={coeff}
        onChange={handleCoeffChange}
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

export const ConstFunc = ({ handleCoeffChange, handleConstTypeChange }) => {
  const [modelData, setModelData] = useContext(ModelDataContext);
  return modelData.constCoef.map((constArray, j) => {
    return (
      <div key={`constraint-${j}`}>
        <ConstraintLHS
          constArray={constArray}
          numVar={modelData.numVar}
          j={j}
          handleCoeffChange={handleCoeffChange}
        ></ConstraintLHS>
        <select
          name={`ctype-${j + 1}`}
          id={`ctype-${j + 1}`}
          value={modelData.constType[j]}
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
          value={modelData.constRHS[j]}
          onChange={handleCoeffChange}
        />
      </div>
    );
  });
};
