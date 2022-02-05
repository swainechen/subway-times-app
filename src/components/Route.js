import React from 'react';
import Time from './Time';

const Route = ({route }) => {
  const sorted_times = route.times.sort(function(a,b) { return a - b;})
	return(
		<li className='route'>
      <ul> Train: {route.route_id}
        <li>
          Direction: {
            route.direction === 'N' ?
            <span>Uptown</span> :
            <span>Downtown</span>
          }
        </li>
        <li>
        Times: 
          <ul>
            {sorted_times.map((time, i) =>
              <Time key={i} time={time} />
            )}
          </ul>
        </li>
      </ul>
		</li>
	);
};

export default Route;