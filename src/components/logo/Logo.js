import React from "react";
import Tilt from 'react-parallax-tilt';
import brain from './brain.png';
import './Logo.css';

const Logo = () => {
    return (
        <div className="ma4 mt0">
            <Tilt>
                <div className="Tilt br2 shadow-2" style={{ height: '100px', width: '100px' }}>
                    <img style={{padding: '5px'}} alt='logo' src={brain} height="70px" width="70px"/>
                </div>
            </Tilt>
        </div>
    );
}

export default Logo;