import React from 'react';

const Time = ({time }) => {

  const minutes = Math.floor(time.time / 60);
  const seconds = Math.round(time.time % 60);
  const timeDisplay = minutes < 5 ? `${minutes} m ${seconds} s` : `${minutes} mins`;

  // Determine direction display based on route type
  const getDirectionDisplay = () => {
    const direction = time.direction;
    const routeType = time.route_type || 'SUBWAY';

    if (routeType === 'FERRY') {
      // For ferries, use In/Out
      if (direction === 'I' || direction === 'W') {
        return (
          <span className='bannertext' style={{color: 'green'}}>
            In{time.next_stop || time.terminal ? ` to ${time.next_stop || time.terminal}` : ''}
          </span>
        );
      }
      if (direction === 'O' || direction === 'E') {
        return (
          <span className='bannertext' style={{color: 'green'}}>
            Out{time.next_stop || time.terminal ? ` to ${time.next_stop || time.terminal}` : ''}
          </span>
        );
      }
      // Fallback for unknown ferry directions
      return (
        <span className='bannertext' style={{color: 'green'}}>
          {direction}
        </span>
      );
    } else {
      // For subways, use Up/Down
      if (direction === 'N') {
        return <span className='bannertext' style={{color: 'green'}}>Up</span>;
      }
      if (direction === 'S') {
        return <span className='bannertext' style={{color: 'green'}}>Dn</span>;
      }
      if (direction === 'I') {
        return (
          <span className='bannertext' style={{color: 'green'}}>
            In{time.next_stop || time.terminal ? ` to ${time.next_stop || time.terminal}` : ''}
          </span>
        );
      }
      if (direction === 'O') {
        return (
          <span className='bannertext' style={{color: 'green'}}>
            Out{time.next_stop || time.terminal ? ` to ${time.next_stop || time.terminal}` : ''}
          </span>
        );
      }
      // Fallback for unknown directions
      return (
        <span className='bannertext' style={{color: 'green'}}>
          {direction}
        </span>
      );
    }
  };

	return(
    <div>
      <span className="time">
        <b className="circle" style={{backgroundColor: time.color}}>
          {time.route_id}
        </b>
        &nbsp;
        &nbsp;
        {getDirectionDisplay()}
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