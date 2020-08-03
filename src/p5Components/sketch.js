//https://dev.to/christiankastner/integrating-p5-js-with-react-i0d

const s = ( sketch ) => {
    let canvasSize=1000;
    let gridStartX=100;
    let gridStartY=100;
    let gridSize=30;
    let gridIncre=20;
    sketch.setup = () => {
        sketch.createCanvas(canvasSize,canvasSize);
    };
  
    sketch.draw = () => {
        sketch.background("white");
  
        sketch.stroke(40);
        for(var i=0;i<=gridSize;i++){
          if(i===(gridSize/2)) sketch.stroke(0);
          sketch.line(gridStartX+i*gridIncre,gridStartY,gridStartX+i*gridIncre,gridStartY+gridSize*gridIncre);
          sketch.line(gridStartX,gridStartY+i*gridIncre,gridStartX+gridSize*gridIncre,gridStartY+i*gridIncre);
          sketch.stroke(40);
        }
    };
  };
  
export {s};