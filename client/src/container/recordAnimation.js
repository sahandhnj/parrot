import React, { Component } from 'react';
import '../style/RecordAnimation.css';
import hal from '../../public/hal9000.png';



// initial setup
const canvas = document.querySelector("#assistant-canvas");
const c = canvas.getContext("2d");
c.fillStyle = "red";
c.strokeStyle = "red";
c.fillRect(0, 0, 1000, 1000);

console.log(document.querySelector("#assistant-canvas"));

canvas.width = innerWidth;
canvas.height = innerHeight;


cx = canvas.width / 2;
cy = canvas.height / 2;

var blueprint = [
    { x: cx, y: cy, radius: 200, startAngle: 0, endAngle: 360, length: 360, speed: 0, color: "#f8f8ff", lw: 10, ccw: false },
    { x: cx, y: cy, radius: 220, startAngle: 0, endAngle: 60, length: 60, speed: 0.5, color: "#f8f8ff", lw: 15, ccw: false },
    { x: cx, y: cy, radius: 220, startAngle: 120, endAngle: 180, length: 60, speed: 0.5, color: "#f8f8ff", lw: 15, ccw: false },
    { x: cx, y: cy, radius: 220, startAngle: 240, endAngle: 300, length: 60, speed: 0.5, color: "#f8f8ff", lw: 15, ccw: false },
    { x: cx, y: cy, radius: 240, startAngle: 20, endAngle: 120, length: 100, speed: 1, color: "#f8f8ff", lw: 15, ccw: false },
    { x: cx, y: cy, radius: 240, startAngle: 140, endAngle: 240, length: 100, speed: 1, color: "#f8f8ff", lw: 15, ccw: false },
    { x: cx, y: cy, radius: 240, startAngle: 260, endAngle: 360, length: 100, speed: 1, color: "#f8f8ff", lw: 15, ccw: false }
]

var blueprint2 = [
    { x: cx, y: cy, radius: 200, startAngle: 0, endAngle: 360, length: 360, speed: 0, color: "#FF0000", lw: 10, ccw: false },
    { x: cx, y: cy, radius: 220, startAngle: 0, endAngle: 60, length: 60, speed: -3, color: "#FF0000", lw: 15, ccw: false },
    { x: cx, y: cy, radius: 220, startAngle: 120, endAngle: 180, length: 60, speed: -3, color: "#FF0000", lw: 15, ccw: false },
    { x: cx, y: cy, radius: 220, startAngle: 240, endAngle: 300, length: 60, speed: -3, color: "#FF0000", lw: 15, ccw: false },
    { x: cx, y: cy, radius: 240, startAngle: 20, endAngle: 120, length: 100, speed: 1, color: "#FF0000", lw: 15, ccw: false },
    { x: cx, y: cy, radius: 240, startAngle: 140, endAngle: 240, length: 100, speed: 1, color: "#FF0000", lw: 15, ccw: false },
    { x: cx, y: cy, radius: 240, startAngle: 260, endAngle: 360, length: 100, speed: 1, color: "#FF0000", lw: 15, ccw: false }
]

function Assistant(blueprint) {

    const radian = Math.PI / 180;

    this.update = () => {
        blueprint.forEach(function (el) {
            el.startAngle = el.startAngle + el.speed;
            el.endAngle = el.endAngle + el.speed;
            //console.log(el.speed);
            draw()
        });
    };

    draw = () => {
        blueprint.forEach(function (el) {
            c.beginPath();
            c.strokeStyle = el.color;
            c.lineWidth = el.lw;
            c.arc(el.x, el.y, el.radius, el.startAngle * radian, el.endAngle * radian, el.ccw);
            c.lineCap = "round";
            c.stroke();
            c.closePath();
        });
    };
}

canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);

var listening = false;


function onMouseDown() {
    listening = true;
    counter++;
    console.log("listening: ", listening);
    animate2();
}

function onMouseUp() {
    listening = false;
    console.log("listening: ", listening);
    animate1();
}

let counter = 0;
var animate1 = function animate1() {
    if (!listening) {
        let localCounter = counter;
        requestAnimationFrame(animate1);
        c.clearRect(0, 0, canvas.width, canvas.height);
        var assistant = new Assistant(blueprint);
        assistant.update();
    }
}


var animate2 = function animate2() {
    if (listening) {
        requestAnimationFrame(animate2);
        c.clearRect(0, 0, canvas.width, canvas.height);
        new Assistant(blueprint2).update();
    }
}

animate1();

class RecordAnimation extends Component {
    constructor(...props) {
        super(...props);

        this.state = {};
    }

    transcript() {
        if (this.props.transcript) {
            return 'You said: ' + this.props.transcript;
        }
    }

    _handleContextMenu = (event) => {
        event.preventDefault();
    }

    render() {
        return (
            <canvas id="assistant-canvas" width="1000" height="700">
                YOUR BROWSER IS NOT SUPPORTING CANVAS
            </canvas>
        );
    }
}

export default RecordAnimation;
