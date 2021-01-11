import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as handpose from "@tensorflow-models/handpose";
import Handsfree from "handsfree";
// var video = document.querySelector("#videoElement");
var canvas = document.querySelector("#canvasElement");
var ctx = canvas.getContext("2d");
var videoConfig = {width: {exact: 1280}, height: {exact: 720}}


window.addEventListener("DOMContentLoaded", () => {
    // var video = document.querySelector("#videoElement");
    canvas = document.querySelector("#canvasElement");
    ctx = canvas.getContext("2d");
    videoConfig = {width: {exact: 1280}, height: {exact: 720}}
    canvas.width = videoConfig.width.exact;
    canvas.height = videoConfig.height.exact
    // setupCamera()
    const handsfree = new Handsfree({
        hands: {
          enabled: true,
          // The maximum number of hands to detect [0 - 4]
          maxNumHands: 1,
      
          // Minimum confidence [0 - 1] for a hand to be considered detected
          minDetectionConfidence: 0.5,
      
          // Minimum confidence [0 - 1] for the landmark tracker to be considered detected
          // Higher values are more robust at the expense of higher latency
          minTrackingConfidence: 0.5
        }
      })
    handsfree.start();
    setInterval(() => {
        if (handsfree.data.hands !== undefined && 
            handsfree.data.hands.multiHandLandmarks !== undefined) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                styleHand(handsfree.data.hands.multiHandLandmarks[0]);
                
        }
    }, 25)
});

const runHandPose = async () => {
    const net = await handpose.load()
    console.log('Handpose model loaded')
    setInterval(() => {
        detect(net, )
    }, 5);
}

const detect = async (net) => {
    const hand = await net.estimateHands(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHand(hand);

}

const styleHand = (landmarks) => {
    for (let i = 0; i<landmarks.length; i++) {
        const x = landmarks[i].x * 1000
        const y = landmarks[i].y * 1000

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 3 * Math.PI)

        ctx.fillStyle = "indigo"
        ctx.fill();
    }
}

const drawHand = (predictions) => {
    if (predictions.length>0) {
        predictions.forEach((prediction) => {
            const landmarks = prediction.landmarks;

            for (let i = 0; i<landmarks.length; i++) {
                const x = landmarks[i][0]
                const y = landmarks[i][1]

                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 3 * Math.PI)

                ctx.fillStyle = "indigo"
                ctx.fill();
            }
        })
    }
}

const setupWidthAndHeight = () => {
    video.width = videoConfig.width.exact;
    video.height = videoConfig.height.exact;
    
    canvas.width = videoConfig.width.exact;
    canvas.height = videoConfig.height.exact
}

const setupCamera = async () => {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: videoConfig })
            .then(function (stream) {
                video.srcObject = stream;
                setupWidthAndHeight();
                runHandPose()
            })
            .catch(function (error) {
                console.log("Something went wrong!");
            });
    }
}
