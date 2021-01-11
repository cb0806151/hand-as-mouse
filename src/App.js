import '@tensorflow/tfjs-backend-webgl';
import * as handpose from "@tensorflow-models/handpose";
import './App.css';
import React, { useRef } from "react";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const videoConfig = {width: 1280, height: 720}

  const init = () => {
    runHandPose();
  }

  const runHandPose = async () => {
    const net = await handpose.load()
    console.log('Handpose model loaded')
    
    setInterval(() => {
        detect(net)
    }, 25);
  }

  const detect = async (net) => {
    if (typeof webcamRef.current !== "undefined" && 
        webcamRef.current !== null &&
        webcamRef.current.video.readyState === 4) {

        const hand = await net.estimateHands(webcamRef.current.video);
        drawHand(hand);
    }

  }

  const drawHand = (predictions) => {
      if (predictions.length>0) {
          predictions.forEach((prediction) => {
              const landmarks = prediction.landmarks;

              for (let i = 0; i<landmarks.length; i++) {
                  const x = landmarks[i][0]
                  const y = landmarks[i][1]

                  const ctx = canvasRef.current.getContext("2d");
                  ctx.beginPath();
                  ctx.arc(x, y, 5, 0, 3 * Math.PI)
                  ctx.fillStyle = "indigo"
                  ctx.fill();
              }
          })
      }
  }

  init();

  return (
    <div className="App">
      <header className="App-header">
       <Webcam ref={webcamRef}
       style={{
         width: videoConfig.width,
         height: videoConfig.height,
       }}></Webcam>
       <canvas ref={canvasRef}
       style={{
        position: "absolute",
        width: videoConfig.width,
        height: videoConfig.height,
      }}></canvas>
      </header>
    </div>
  );
}

export default App;
