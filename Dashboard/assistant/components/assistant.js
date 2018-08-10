import React, { Component } from 'react';


export default class Assistant extends Component {
    constructor(props) {
        super(props);
        // this.paint = this.paint.bind(this);
    }
  
    componentDidMount() {
        this.updateCanvas();
    }
    
    updateCanvas() {
        const canvas = this.refs.canvas;
        const c = canvas.getContext("2d");
        
        
        
        
        c.fillRect(0, 0, 100, 100);        
    }


    render() {
        return(
            <div>
                <canvas ref="canvas" width={1000} height={700} />
            </div>
        )
      }

}