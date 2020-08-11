import React from "react";
import ReactDOM from "react-dom";
import D3Component from "./../D3Component.jsx";
import {
  render,
  cleanup,
  fireEvent,
  waitFor,
  screen,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import TestRenderer from "react-test-renderer";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<D3Component modelValid={false}></D3Component>, div);
});

it("matches snapshot", () => {
  const modelData = {
    numVar: 2,
    numConst: 3,
    obj: "maximize",
    objCoef: [5, 4],
    constCoef: [
      [2, 1],
      [1, 1],
      [1, 2],
    ],
    constType: ["less", "less", "great"],
    constRHS: [20, 18, 12],
  };
  const modelResult = {
    problemSolved: true,
    augmentedModel: {
      numVar: 6,
      numConst: 3,
      obj: "maximize",
      objCoef: [5, 4, 0, 0, 0, -9999],
      constCoef: [
        [2, 1, 1, 0, 0, 0],
        [1, 1, 0, 1, 0, 0],
        [1, 2, 0, 0, -1, 1],
      ],
      constType: ["equal", "equal", "equal"],
      constRHS: [20, 18, 12],
      realVar: [1, 1, 0, 0, 0, 0],
    },
    iteratedSol: [
      [0, 0, 20, 18, 0, 12],
      [0, 6, 14, 12, 0, 0],
      [9.333333333333332, 1.333333333333334, 0, 7.333333333333332, 0, 0],
      [2, 16, 0, 0, 22, 0],
    ],
  };
  const graphics = TestRenderer
    .create(
      <D3Component
        modelValid={true}
        modelData={modelData}
        modelResult={modelResult}
      ></D3Component>
    )
    .toJSON();
  expect(graphics).toMatchSnapshot();
});
