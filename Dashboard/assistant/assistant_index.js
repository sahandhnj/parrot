import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Assistant from './components/assistant.js';
// import SearchBar from './components/search_bar';
// import YTSearch from 'youtube-api-search';
// import VideoList from './components/video_list';
// import VideoDetail from './components/video_detail';
// const API_KEY = 'AIzaSyCciYwNYntaV_taZe5BRV-zGU2zqamx_uo';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            // videos: [],
            // selectedVideo: null
        };

        // YTSearch({key: API_KEY, term: 'surfboards'}, (videos) => {
        //     this.setState({ 
        //         videos: videos,
        //         selectedVideo: videos[0]                
        //     });
        // });
    }

    render() {
        return(
            <div>
                <Assistant />
            </div>
        );      
    }
}

// Take components generated html and put in on the page (in the dom)
ReactDOM.render(<App />, document.querySelector('.container'));   // create an instance and render it to the DOM