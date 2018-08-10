import React, { Component } from 'react';
import './style/App.css';

import WaveStream from 'react-wave-stream';
import Recorder from './service/recorder';
import RecordAnimation from './container/recordAnimation';


class App extends Component {
	constructor(...props) {
		super(...props);

		this.state = {
			blob: null,
			isRecording: false,
			stream: null,
			transcript: null,
			analyserData: { data: [], lineTo: 0 },
		};

		this.start = this.start.bind(this);
		this.stop = this.stop.bind(this);

		this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

		this.recorder = new Recorder(this.audioContext, {
			onAnalysed: data => this.setState({ analyserData: data }),
		});

		navigator.mediaDevices.getUserMedia({ audio: true })
			.then((stream) => {
				this.setState({ stream });
				this.recorder.init(stream);
			})
			.catch(this.dontGotStream);
	}

	start() {
		this.recorder.start()
			.then(() => this.setState({ isRecording: true }));
	}

	async stop() {
		const { blob } = await this.recorder.stop();

		this.setState({
			isRecording: false,
			blob,
		});

		const transcript = await Recorder.process(this.state.blob);

		this.setState({
			blob: null,
			transcript: transcript,
		});
	}

	dontGotStream(error) {
		console.log('Get stream failed', error);
	}

	render() {
		return (
			<div className="App">
				<div className="App-header">
					<h2>VA</h2>
					<RecordAnimation down={this.start} up={this.stop} isRecording={this.state.isRecording} transcript={this.state.transcript} />
				</div>
				<div className="wave-stream-container">
					<WaveStream {...this.state.analyserData} />
				</div>
				<div>
					<audio id="playAudio">
						<source type="audio/mpeg" />
					</audio>
				</div>
			</div>

		);
	}
}

export default App;