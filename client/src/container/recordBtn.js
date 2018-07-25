import React, { Component } from 'react';
import '../style/RecordBtn.css';
import hal from '../../public/hal9000.png';

class RecordBtn extends Component {
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
            <div id="record-btn" className="centre" onContextMenu={this._handleContextMenu}>
                <div id="presentation">
                    <p>{this.props.isRecording ? "Recording ..." : "Listening ..."}</p>
                </div>
                <div className="icon" onMouseDown={this.props.down} onMouseUp={this.props.up} onTouchStart={this.props.down} onTouchEnd={this.props.up}>
                    <img src={hal} alt="VirtualAssistant" />
                    <div id="transcript">
                        {this.transcript()}
                    </div>
                </div>
            </div>
        );
    }
}

export default RecordBtn;
