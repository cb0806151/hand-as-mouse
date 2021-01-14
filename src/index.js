import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as handpose from "@tensorflow-models/handpose";
import Handsfree from "handsfree";
import './style.css'
import { get } from 'lodash'

var canvas = document.getElementById("canvasEl")
var ctx = document.getElementById("canvasEl").getContext("2d")
var cursor = document.getElementById("cursorEl");
var hoveredElem = undefined;
var clickedElem = undefined;
var scrolledElem = undefined;
var drewElem = undefined;
var status = null;
var lastStatus = null;
var positionOnClick = [undefined, undefined];
var clickGauge = 0
var cursorX = 0;
var cursorY = 0;
var scrollStartPosition = 0;
var lastLinePosition = [undefined, undefined]
var canDraw = false;
var items = {
    0: {
        "name": "Greek Salad",
        "price": 4.99
    },
    1: {
        "name": "Chicken Sandwich",
        "price": 4.99
    },
    2: {
        "name": "French Fries",
        "price": 1.99
    },
    3: {
        "name": "Soda",
        "price": 0.99
    },
}
var currentOrder = {}

window.addEventListener("DOMContentLoaded", () => {
    cursor = document.getElementById("cursorEl");
    canvas = document.getElementById("canvasEl")
    ctx = canvas.getContext("2d")

    const handsfree = new Handsfree({
        hands: {
          enabled: true,
          maxNumHands: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5
        }
      })
    handsfree.start();

    handsfree.on('finger-pinched-start-1-0', () => {
        if (drewElem !== undefined) lastLinePosition = [cursorX, cursorY]
        canDraw = true
    })

    handsfree.on('finger-pinched-released-1-0', () => {
        canDraw = false
    })
    
    setInterval(() => {
        if (handsfree.data.hands !== undefined && 
            handsfree.data.hands.multiHandLandmarks !== undefined) {
                let landmarks = handsfree.data.hands.multiHandLandmarks[0]
                moveCursor(handsfree.data.hands.multiHandLandmarks[0])
                checkSideOfHand(landmarks)
                checkElementsNearCursor()
                if (cursor != null) setCursorStyle()
                checkIfClicking()
                checkIfHovered()
                checkIfScrolling()
                checkIfDrawing()
        }
    }, 25)
});

window.orderItem = (itemId) => {
    if (get(currentOrder, `${itemId}.quantity`, undefined) === undefined) currentOrder[itemId] = {quantity:0}
    currentOrder[itemId].quantity += 1
}

const checkElementsNearCursor = () => {
    let elems = document.elementsFromPoint(cursorX, cursorY)
    hoveredElem = elems.find(e => e.classList.contains("hoverable"))
    clickedElem = elems.find(e => e.classList.contains("clickable"))
    scrolledElem = elems.find(e => e.classList.contains("scrollable"))
    drewElem = elems.find(e => e.classList.contains("drawable"))
}

const checkIfHovered = () => {

    if (hoveredElem === undefined) {
        var allClickableElements = document.querySelectorAll('.hoverable')
        allClickableElements.forEach((elem) => {
            elem.classList.remove(elem.dataset.hover)
        });
    } else {
        hoveredElem.classList.add(hoveredElem.dataset.hover)
    }
}

const checkIfScrolling = () => {
    if (scrolledElem !== undefined && status == "back" && positionOnClick[0] !== undefined) {
        scrolledElem.scrollLeft = scrollStartPosition + (cursorX - positionOnClick[0])
    } 
}

const checkIfDrawing = () => {

    if (canDraw === true && drewElem !== undefined && lastLinePosition[0] !== undefined) {
        ctx.beginPath()
        ctx.strokeStyle = "white";
        ctx.lineWdith = 2;
        ctx.moveTo(lastLinePosition[0] - 500, lastLinePosition[1])
        ctx.lineTo(cursorX - 500, cursorY)
        ctx.stroke()
        ctx.closePath()
        lastLinePosition = [cursorX, cursorY]
    }
}

const setCursorStyle = () => {

    if (status == "back") {
        // cursor.style.backgroundColor = "lime"
        document.getElementById("cursorDefault").classList.add("hidden")
        document.getElementById("cursorSelect").classList.remove("hidden")
    } else {
        // cursor.style.backgroundColor = "red"
        document.getElementById("cursorDefault").classList.remove("hidden")
        document.getElementById("cursorSelect").classList.add("hidden")
        if (hoveredElem !== undefined) clickedElem.style.backgroundImage = "none"
    }

    if (hoveredElem === undefined) {
        clickGauge = 0
    } else {
        if (status == "back") {
            clickGauge += 1
        }
    }
}

const checkIfClicking = () => {

    if (clickedElem !== undefined && status == "back") {
        let gradient = `linear-gradient(to left, rgba(255, 255, 255, 0.5) ${(clickGauge/20)*100}%, ${getComputedStyle(clickedElem).backgroundColor} ${(clickGauge/20)*100}%)`
        clickedElem.style.backgroundImage = gradient
        if (clickGauge === 20) {
            clickGauge = 0
            clickedElem.click();
        }
    } 
}

const getSideOfHand = (landmarks, flipped) => {
    lastStatus = status
    let options = ["palm", "back"];
    if (flipped) options.reverse();

    if (landmarks[0].y - landmarks[12].y > 0) {
        status = options[0]
    } else {
        status = options[1]
    }
    if (status !== lastStatus) {
        positionOnClick = [cursorX, cursorY]
        if (scrolledElem !== undefined) scrollStartPosition = scrolledElem.scrollLeft
        // if (drewElem !== undefined) lastLinePosition = [cursorX, cursorY]
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
    cursorX = (window.innerWidth - (landmarks[9].x * 1300))
    cursorY = (landmarks[9].y * 800)
    if (cursor != null) {
        cursor.style.left = cursorX + 'px'
        cursor.style.top = cursorY + 'px'
    }
}
