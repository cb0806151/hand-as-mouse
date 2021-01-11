import '@tensorflow/tfjs-backend-webgl';
import * as handpose from "@tensorflow-models/handpose";
import './App.css';
import React, { useRef, Component } from "react";
import Webcam from "react-webcam";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      webcamRef: useRef(null),
      canvasRef: useRef(null),
      videoConfig: {width: 1280, height: 720},
     };
  }

  componentDidUpdate = () => {
    this.runHandPose();
  }

  runHandPose = async () => {
    const net = await handpose.load()
    console.log('Handpose model loaded')
    
    setInterval(() => {
        this.detect(net)
    }, 25);
  }

  detect = async (net) => {
    if (typeof this.state.webcamRef.current !== "undefined" && 
        this.state.webcamRef.current !== null &&
        this.state.webcamRef.current.video.readyState === 4) {

        const hand = await net.estimateHands(this.state.webcamRef.current.video);
        this.drawHand(hand);
    }

  }

  drawHand = (predictions) => {
      if (predictions.length>0) {
          predictions.forEach((prediction) => {
              const landmarks = prediction.landmarks;

              for (let i = 0; i<landmarks.length; i++) {
                  const x = landmarks[i][0]
                  const y = landmarks[i][1]

                  const ctx = this.state.canvasRef.current.getContext("2d");
                  ctx.beginPath();
                  ctx.arc(x, y, 5, 0, 3 * Math.PI)
                  ctx.fillStyle = "indigo"
                  ctx.fill();
              }
          })
      }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
        <Webcam ref={this.state.webcamRef}
        style={{
          width: this.state.videoConfig.width,
          height: this.state.videoConfig.height,
        }}></Webcam>
        <canvas ref={this.state.canvasRef}
        style={{
          position: "absolute",
          width: this.state.videoConfig.width,
          height: this.state.videoConfig.height,
        }}></canvas>
        </header>
      </div>
    );
  }
}

export default App;
