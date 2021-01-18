import '@tensorflow/tfjs-backend-webgl';
import Handsfree from "handsfree";
import './style.css'
import { get } from 'lodash'

var canvas = document.getElementById("canvasEl")
var ctx = document.getElementById("canvasEl").getContext("2d")
var cursor = document.getElementById("cursorEl");
var handCheckBar = document.getElementById("dominantHandLoadBar")
var hoveredElem = undefined;
var clickedElem = undefined;
var scrolledElem = undefined;
var drewElem = undefined;
var lastElemClicked = undefined;
var status = null;
var lastStatus = null;
var positionOnClick = [undefined, undefined];
var clickGauge = 0
var cursorX = 0;
var cursorY = 0;
var scrollStartPosition = 0;
var lastLinePosition = [undefined, undefined]
var canDraw = false;
var maxClickGauge = 30;
var rightHanded = undefined;
var handCheckTimer = 0
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
const handsfree = new Handsfree({
    hands: {
      enabled: true,
      maxNumHands: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5
    }
  })

window.addEventListener("DOMContentLoaded", () => {
    cursor = document.getElementById("cursorEl");
    canvas = document.getElementById("canvasEl")
    handsfree.start(() => {
        document.getElementById("loadingScreen").classList.add("hidden")
    });

    setInterval(() => {
        if (handsfree.data.hands !== undefined && 
            handsfree.data.hands.multiHandLandmarks !== undefined) {
                let landmarks = handsfree.data.hands.multiHandLandmarks[0]
                moveCursor(landmarks)
                if (rightHanded === undefined) {
                    checkDominantHand(handsfree.data.hands.multiHandedness[0])
                } else {
                    checkSideOfHand(landmarks)
                    checkElementsNearCursor()
                    if (cursor != null) setCursorStyle()
                    checkIfClicking()
                    checkIfHovered()
                    checkIfScrolling()
                    checkIfDrawing()
                }
        }
    }, 25)
});

window.eraseSignature = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

window.goToPage = (going, leaving) => {
    if (going === 'verifyPage' && Object.keys(currentOrder).length === 0) return;
    document.getElementById(leaving).classList.add("hidden")
    document.getElementById(going).classList.remove("hidden")
    if (going === 'confirmPage') {
        setCanvasDimensions();
    }
}

window.orderItem = (itemId) => {
    if (get(currentOrder, `${itemId}.quantity`, undefined) === undefined) currentOrder[itemId] = {quantity:0}
    currentOrder[itemId].quantity += 1
    createOrderTray();
}

window.removeItem = (itemId) => {
    currentOrder[itemId].quantity -= 1
    if (currentOrder[itemId].quantity === 0) delete currentOrder[itemId]
    if (Object.entries(currentOrder).length === 0) {
        goToPage('orderPage', 'verifyPage')
        return
    }
    createOrderTray();
    
}

const setPinchListener = () => {
    handsfree.on(`finger-pinched-start-${rightHanded ? 1 : 0}-0`, () => {
        if (drewElem !== undefined) lastLinePosition = [cursorX, cursorY]
        canDraw = true
    })

    handsfree.on(`finger-pinched-released-${rightHanded ? 1 : 0}-0`, () => {
        canDraw = false
    })
}

const setCanvasDimensions = () => {
    canvas.width = getComputedStyle(canvas).width.slice(0, -2)
    canvas.height = getComputedStyle(canvas).height.slice(0, -2)
    ctx = canvas.getContext("2d")
}

const createOrderTray = () => {
    let tray = document.getElementById("orderTray")
    tray.textContent = ''
    Object.entries(currentOrder).forEach((elem) => {
        let entryString = `
        <div data-hover="bg-red-500" class="bg-white w-72 p-8 rounded-lg mb-3 mr-3 hoverable clickable" onclick="removeItem(${parseInt(elem[0])})">
            <p class="font-bold text-3x1">${elem[1].quantity} x ${items[parseInt(elem[0])].name} = ${items[parseInt(elem[0])].price * elem[1].quantity}</p>
        </div>
        `
        let entry = new DOMParser().parseFromString(entryString, "text/html")
        tray.appendChild(entry.firstChild)
    })
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
            elem.style.backgroundImage = "none"
        });
    } else {
        hoveredElem.classList.add(hoveredElem.dataset.hover)
    }
}

const checkIfScrolling = () => {
    if (clickedElem === undefined && 
        scrolledElem !== undefined && 
        status == "back" && 
        positionOnClick[0] !== undefined) {

        if (scrolledElem.dataset.scroll !== undefined) {
            document.getElementById(scrolledElem.dataset.scroll).scrollLeft = scrollStartPosition + (cursorX - positionOnClick[0])
        } else {
            scrolledElem.scrollLeft = scrollStartPosition + (cursorX - positionOnClick[0])
        }
        
    } 
}

const checkIfDrawing = () => {

    if (canDraw === true && drewElem !== undefined && lastLinePosition[0] !== undefined) {
        ctx.beginPath()
        ctx.lineWdith = 2;
        ctx.moveTo(lastLinePosition[0] - 100, lastLinePosition[1])
        ctx.lineTo(cursorX - 100, cursorY)
        ctx.stroke()
        ctx.closePath()
        lastLinePosition = [cursorX, cursorY]
    }
}

const setCursorStyle = () => {

    if (status == "back") {
        document.getElementById("cursorDefault").classList.add("hidden")
        document.getElementById("cursorSelect").classList.remove("hidden")
    } else {
        document.getElementById("cursorDefault").classList.remove("hidden")
        document.getElementById("cursorSelect").classList.add("hidden")
        clickGauge = 0;
        if (hoveredElem !== undefined && clickedElem !== undefined) clickedElem.style.backgroundImage = "none"
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
        let gradient = `linear-gradient(to left, rgba(255, 255, 255, 0.5) ${(clickGauge/maxClickGauge)*100}%, ${getComputedStyle(clickedElem).backgroundColor} ${(clickGauge/maxClickGauge)*100}%)`
        clickedElem.style.backgroundImage = gradient
        lastElemClicked = clickedElem
        if (clickGauge === maxClickGauge) {
            clickGauge = 0
            clickedElem.click();
        }
    } 
}

const getSideOfHand = (landmarks, flipped) => {
    lastStatus = status
    let options = ["palm", "back"];
    if (flipped) options.reverse();

    let handUpsideDown = (landmarks[0].y - landmarks[12].y) > 0
    if (handUpsideDown) {
        status = options[0]
    } else {
        status = options[1]
    }
    if (status !== lastStatus) {
        positionOnClick = [cursorX, cursorY]
        if (scrolledElem !== undefined) {
            if (scrolledElem.dataset.scroll !== undefined) {
                scrollStartPosition = document.getElementById(scrolledElem.dataset.scroll).scrollLeft
            } else {
                scrollStartPosition = scrolledElem.scrollLeft
            }
        }
        if (scrolledElem.dataset.scroll !== undefined) scrollStartPosition = document.getElementById(scrolledElem.dataset.scroll).scrollLeft
        if (lastElemClicked !== undefined) lastElemClicked.style.backgroundImage = "none"
    }
}

const checkSideOfHand = (landmarks) => {

    let palmDeteced = (landmarks[20].x - landmarks[4].x) * (rightHanded ? -1 : 1) > 0
    if (palmDeteced) {
        getSideOfHand(landmarks, false)
    } else {
        getSideOfHand(landmarks, true)
    }
}

const moveCursor = (landmarks, handData) => {
    cursorX = (window.innerWidth - (landmarks[9].x * 1300))
    cursorY = (landmarks[9].y * 800)

    if (cursor != null) {
        cursor.style.left = cursorX + 'px'
        cursor.style.top = cursorY + 'px'
    }
}

const checkDominantHand = (handData) => {
    if (handCheckTimer < maxClickGauge) {
        handCheckTimer += 1
        let gradient = `linear-gradient(to left, rgba(52, 211, 153, 1) ${(handCheckTimer/maxClickGauge)*100}%, ${getComputedStyle(handCheckBar).backgroundColor} ${(handCheckTimer/maxClickGauge)*100}%)`
        handCheckBar.style.backgroundImage = gradient
    } else {
        if (handData.label === "Right") {
            rightHanded = false
            document.getElementById("cursorDefault").setAttribute('transform', 'scale(-1, 1)') 
            document.getElementById("cursorSelect").setAttribute('transform', 'scale(-1, 1)') 
        } else {
            rightHanded = true
        }
        document.getElementById("handCheckMessage").innerHTML = `${rightHanded ? `Right hand` : `Left hand`} selected.<br/><br/>To click, flip the back of your hand to face the camera and hold until the timer on the button finishes.<br/><br/>To scroll, flip the back of your hand to face the camera on a button that says "scroll bar" and drag it in the direction you want the actual scroll bar (usually found above the button) to move.<br/><br/>To write, pinch your index finger and thumb together and trace letters.`
        document.getElementById("handCheckContinueButton").classList.remove("hidden")
        setPinchListener()
    }
}
