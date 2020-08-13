import React from "react";
import ReactDOM from "react-dom";
import EquationInput from "./../EquationInput.jsx";
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
  ReactDOM.render(<EquationInput></EquationInput>, div);
});
