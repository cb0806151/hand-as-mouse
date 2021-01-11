import '@tensorflow/tfjs-backend-webgl';
import * as handpose from "@tensorflow-models/handpose";
import './App.css';
import React, { Component } from "react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      video: null,
      canvas: null,
      ctx: null,
      videoConfig: {width: 1280, height: 720},
     };
  }

  componentDidMount = () => {
    this.setState({
      video: document.querySelector("#videoElement"),
      canvas: document.querySelector("#canvasElement"),
      ctx: document.querySelector("#canvasElement").getContext("2d"),
    })
    this.setupCamera();
  }

  runHandPose = async () => {
      const net = await handpose.load(Infinity, 0.4)
      console.log('Handpose model loaded')
      setInterval(() => {
          this.detect(net)
      }, 25);
  }

  detect = async (net) => {
      const hand = await net.estimateHands(this.state.video);
      this.state.ctx.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height);
      this.drawHand(hand);

  }

  drawHand = (predictions) => {
      if (predictions.length>0) {
          predictions.forEach((prediction) => {
              const landmarks = prediction.landmarks;
              let cursor = document.getElementById("cursor")
              cursor.style.left = landmarks[0][0] + 'px'
              cursor.style.top = landmarks[0][1] + 'px'

              for (let i = 0; i<landmarks.length; i++) {
                  const x = landmarks[i][0]
                  const y = landmarks[i][1]

                  this.state.ctx.beginPath();
                  this.state.ctx.arc(x, y, 5, 0, 3 * Math.PI)
                  let ctxElement = this.state.ctx
                  ctxElement.fillStyle = "indigo"
                  this.setState({ctx: ctxElement})
                  this.state.ctx.fill();
              }
          })
      }
  }

  setupWidthAndHeight = () => {
      let videoElement = this.state.video
      videoElement.width = this.state.videoConfig.width;
      videoElement.height = this.state.videoConfig.height;

      let canvasElement = this.state.canvas
      canvasElement.width = this.state.videoConfig.width;
      canvasElement.height = this.state.videoConfig.height;

      this.setState({
        video: videoElement,
        canvas: canvasElement,
      })
  }

  setupCamera = async () => {
      if (navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: this.state.videoConfig })
              .then((stream) => {
                  let videoElement = this.state.video
                  videoElement.srcObject = stream
                  this.setState({video: videoElement})
                  this.setupWidthAndHeight();
                  this.runHandPose()
              })
              .catch(function (error) {
                console.log(error)
                  console.log("Something went wrong!");
              });
      }
  }

  render() {
    return (
      <div className="App">
        <div id="cursor"></div>
        <header className="App-header">
          <canvas id="canvasElement" style={{position: "absolute"}}></canvas>
          <video autoPlay={true} id="videoElement"></video>    
        </header>
      </div>
    );
  }
}

export default App;
