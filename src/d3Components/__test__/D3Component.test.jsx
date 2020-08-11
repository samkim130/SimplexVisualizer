import React from 'react';
import ReactDOM from 'react-dom';
import D3Component from '../D3Component.jsx";
//import {isTSAnyKeyword} from '@babel/types';

it("renders without crashing", ()=>{
    const div= document.createElement("div");
    ReactDOM.render(<D3Component></D3Component>,div);
});