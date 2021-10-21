import React, { Component } from 'react';
import styles from './Canvas2D.module.css';

class Canvas2D extends Component {
    
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
    }

    componentDidMount() {
        this.props.onContextReady(this.canvas.current.getContext('2d'));
    }

    render() {
        return (
            <div className={styles.Canvas2D}>
                <canvas ref={this.canvas} width={this.props.width} height={this.props.height} tabIndex='1'></canvas>
            </div>
        );
    }
}

// Canvas2D.defaultProps = {
//     width: window.innerWidth,
//     height: window.innerHeight,
//     onContextReady: ctx => console.warn('Canvas:props:context not implemented for', ctx)
// }

export default Canvas2D;