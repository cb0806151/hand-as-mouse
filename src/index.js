import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as handpose from "@tensorflow-models/handpose";
import Handsfree from "handsfree";

var cursor = document.getElementById("cursorEl");
var hoveredElem = undefined;
var clickedElem = undefined;
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
                checkElementsNearCursor(landmarks)
                if (cursor != null) setCursorStyle()
                checkIfClicking()
                checkIfHovered()
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

const checkElementsNearCursor = (landmarks) => {
    let elems = document.elementsFromPoint((window.innerWidth - (landmarks[9].x * 1300)), (landmarks[9].y * 800))
    hoveredElem = elems.find(e => e.classList.contains("hoverable"))
    clickedElem = elems.find(e => e.classList.contains("clickable"))
}

const checkIfHovered = () => {

    if (hoveredElem === undefined) {
        var allClickableElements = document.querySelectorAll('.hoverable')
        allClickableElements.forEach((elem) => {
            elem.classList.remove("hovered")
        });
    } else {
        hoveredElem.classList.add("hovered")
    }
}

const setCursorStyle = () => {

    if (status == "back") {
        cursor.style.backgroundColor = "lime"
    } else {
        cursor.style.backgroundColor = "red"
    }

    if (hoveredElem === undefined) {
        clickGauge = 0
        cursor.style.opacity = 0.5
    } else {
        if (status == "back") {
            clickGauge += 1
            cursor.style.opacity = 0.5 + (clickGauge/40)
        }
    }
}

const checkIfClicking = () => {

    if (clickedElem !== undefined && 
        status == "back" && 
        clickGauge === 20) {
        clickGauge = 0
        clickedElem.click();
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
