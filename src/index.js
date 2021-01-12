import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as handpose from "@tensorflow-models/handpose";
import Handsfree from "handsfree";

var cursor = document.getElementById("cursorEl");
var status = null
var clickGauge = 0

window.addEventListener("DOMContentLoaded", () => {
    cursor = document.getElementById("cursorEl");

    const handsfree = new Handsfree({
        hands: {
          enabled: true,
          maxNumHands: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5
        }
      })
    handsfree.start();
    
    setInterval(() => {
        if (handsfree.data.hands !== undefined && 
            handsfree.data.hands.multiHandLandmarks !== undefined) {
                let landmarks = handsfree.data.hands.multiHandLandmarks[0]
                moveCursor(handsfree.data.hands.multiHandLandmarks[0])
                checkSideOfHand(landmarks)
                if (cursor != null) checkIfClicking(landmarks)
        }
    }, 25)
});

window.buttonClicked = () => {
    console.log("button has been clicked")
}

const getSideOfHand = (landmarks, flipped) => {
    let options = ["palm", "back"];
    if (flipped) options.reverse();

    if (landmarks[0].y - landmarks[12].y > 0) {
        status = options[0]
    } else {
        status = options[1]
    }
}

const checkIfClicking = (landmarks) => {
    let elems = document.elementsFromPoint((window.innerWidth - (landmarks[9].x * 1300)), (landmarks[9].y * 800))
    let selectedElem = elems.find(e => e.classList.contains("clickable"))
    
    if (status == "back") {
        cursor.style.backgroundColor = "lime"
    } else {
        cursor.style.backgroundColor = "red"
    }

    if (selectedElem === undefined) {
        clickGauge = 0
        cursor.style.opacity = 0.5
        var allClickableElements = document.querySelectorAll('.clickable')
        allClickableElements.forEach((elem) => {
            elem.blur();
        });
    } else {
        selectedElem.focus();
        if (status == "back") {
            clickGauge += 1
            cursor.style.opacity = 0.5 + (clickGauge/40)
            if (clickGauge === 20) {
                clickGauge = 0
                selectedElem.click();
            }
        }
    }
}

const checkSideOfHand = (landmarks) => {
    if (landmarks[20].x - landmarks[4].x > 0) {
        getSideOfHand(landmarks, false)
    } else {
        getSideOfHand(landmarks, true)
    }
}

const moveCursor = (landmarks) => {
    if (cursor != null) {
        cursor.style.left = (window.innerWidth - (landmarks[9].x * 1300)) + 'px'
        cursor.style.top = (landmarks[9].y * 800) + 'px'
    }
}
