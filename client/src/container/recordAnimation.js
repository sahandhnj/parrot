import React, { Component } from 'react';
import '../style/RecordAnimation.css';
import Assistant from '../service/assistant';
const SPEED= 30;

class RecordAnimation extends Component {
    blueprint1
    blueprint2
    c
    canvas

    constructor(...props) {
        super(...props);

        this.state = {};

        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
    }

    componentDidMount() {
        this.canvas = this.refs.canvas
        this.c = this.canvas.getContext("2d");

        // this.c.fillStyle = "red";
        // this.c.strokeStyle = "red";
        this.c.fillRect(0, 0, 1000, 1000);

        this.canvas.width = 500//innerWidth;
        this.canvas.height = 500//innerHeight;

        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        this.blueprint1 = [
            { x: cx, y: cy, radius: 200, startAngle: 0, endAngle: 360, length: 360, speed: 0, color: "#f8f8ff", lw: 10, ccw: false },
            { x: cx, y: cy, radius: 220, startAngle: 0, endAngle: 60, length: 60, speed: 0.5, color: "#f8f8ff", lw: 15, ccw: false },
            { x: cx, y: cy, radius: 220, startAngle: 120, endAngle: 180, length: 60, speed: 0.5, color: "#f8f8ff", lw: 15, ccw: false },
            { x: cx, y: cy, radius: 220, startAngle: 240, endAngle: 300, length: 60, speed: 0.5, color: "#f8f8ff", lw: 15, ccw: false },
            { x: cx, y: cy, radius: 240, startAngle: 20, endAngle: 120, length: 100, speed: 1, color: "#f8f8ff", lw: 15, ccw: false },
            { x: cx, y: cy, radius: 240, startAngle: 140, endAngle: 240, length: 100, speed: 1, color: "#f8f8ff", lw: 15, ccw: false },
            { x: cx, y: cy, radius: 240, startAngle: 260, endAngle: 360, length: 100, speed: 1, color: "#f8f8ff", lw: 15, ccw: false }
        ]

        this.blueprint2 = [
            { x: cx, y: cy, radius: 200, startAngle: 0, endAngle: 360, length: 360, speed: 0, color: "#FF0000", lw: 10, ccw: false },
            { x: cx, y: cy, radius: 220, startAngle: 0, endAngle: 60, length: 60, speed: -3, color: "#FF0000", lw: 15, ccw: false },
            { x: cx, y: cy, radius: 220, startAngle: 120, endAngle: 180, length: 60, speed: -3, color: "#FF0000", lw: 15, ccw: false },
            { x: cx, y: cy, radius: 220, startAngle: 240, endAngle: 300, length: 60, speed: -3, color: "#FF0000", lw: 15, ccw: false },
            { x: cx, y: cy, radius: 240, startAngle: 20, endAngle: 120, length: 100, speed: 1, color: "#FF0000", lw: 15, ccw: false },
            { x: cx, y: cy, radius: 240, startAngle: 140, endAngle: 240, length: 100, speed: 1, color: "#FF0000", lw: 15, ccw: false },
            { x: cx, y: cy, radius: 240, startAngle: 260, endAngle: 360, length: 100, speed: 1, color: "#FF0000", lw: 15, ccw: false }
        ]


        this.animate1();
        this.animate2();
    }

    animate1() {
        let _this = this;
        let assistant = new Assistant(this.c, this.blueprint1);

        setInterval(() => {
            if (!_this.props.isRecording) {
                _this.c.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                assistant.update();
            }
        }, SPEED);
    }

    animate2() {
        let _this = this;
        let assistant = new Assistant(this.c, this.blueprint2);

        setInterval(() => {
            if (_this.props.isRecording) {
                _this.c.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                assistant.update();
            }
        }, SPEED);
    }

    onMouseDown() {
        this.props.down();
    }

    onMouseUp() {
        this.props.up();
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
            <div onContextMenu={this._handleContextMenu}>
                <canvas ref="canvas" width={640} height={425} onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp} onTouchStart={this.props.down} onTouchEnd={this.props.up}/>
                <div id="transcript">
                    {this.transcript()}
                </div>
            </div>
        );
    }
}

export default RecordAnimation;