import React, { useState, useEffect } from 'react';
import axios from 'axios';

import processService from '../services/objToArray';

const Time = ({time }) => {

  const time_in_seconds = Math.round(time.time/60).toString() + " mins";
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
          <span className='bannertext' style={{color: 'green'}}>Uptown</span> :
          <span className='bannertext' style={{color: 'green'}}>Downtown</span>
        }
        &nbsp;
        &nbsp;
        &nbsp;
        &nbsp;
        &nbsp;
        <span className='bannertext' style={{color: 'E13102'}}>
          {time_in_seconds}
        </span>
      </span>
      <br></br>
      <br></br>

    </div>
	);
};

export default Time;