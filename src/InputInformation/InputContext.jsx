import React, {useContext} from "react";

const TestContext = React.createContext();

export const InputContext=({children})=>{
    return(
        <TestContext>
            {children}
        </TestContext>
    );
};