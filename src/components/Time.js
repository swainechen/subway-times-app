import React, { useState, useEffect } from 'react';
import axios from 'axios';

import processService from '../services/objToArray';

const Time = ({time }) => {

  const minutes = Math.floor(time.time / 60);
  const seconds = Math.round(time.time % 60);
  const timeDisplay = minutes < 5 ? `${minutes} m ${seconds} s` : `${minutes} mins`;

	return(
    <div>
      <span className="time">
        <b className="circle" style={{backgroundColor: time.color}}>
          {time.route_id}
        </b>
        &nbsp;
        &nbsp;
        {
          time.direction === 'N' ?
          <span className='bannertext' style={{color: 'green'}}>Up</span> :
          <span className='bannertext' style={{color: 'green'}}>Dn</span>
        }
        &nbsp;
        &nbsp;
        &nbsp;
        &nbsp;
        &nbsp;
        <span className='bannertext' style={{color: '#E13102'}}>
          {timeDisplay}
        </span>
      </span>
      <br></br>
      <br></br>

    </div>
	);
};

export default Time;