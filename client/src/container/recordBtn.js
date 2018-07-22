import React, { Component } from 'react';
import '../style/RecordBtn.css';
import hal from '../../public/hal9000.png';

class RecordBtn extends Component {
    constructor(...props) {
        super(...props);

        this.state = {};
    }

    render() {
        return (
            <div className="centre">
                <div id="presentation">
                    <p>{this.props.isRecording ? "Recording ..." : "Listening ..."}</p>
                </div>
                <div className="icon" onMouseDown={this.props.down} onMouseUp={this.props.up}>
                    <img id="hal" src={hal} alt="hal9000" />
                    <div id="credits">
                    </div>
                </div>
            </div>
        );
    }
}

export default RecordBtn;
