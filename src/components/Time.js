import React from 'react';

const Time = ({time }) => {

  const minutes = Math.floor(time.time / 60);
  const seconds = Math.round(time.time % 60);
  const timeDisplay = minutes < 5 ? `${minutes} m ${seconds} s` : `${minutes} mins`;

  // Determine direction display based on route type
  const getDirectionDisplay = () => {
    const direction = time.direction;
    const isFerry = time.source === 'ferry';

    if (isFerry) {
      // For ferries, use In/Out and show the next stop if available
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
      // Fallback for ferry direction
      return (
        <span className='bannertext' style={{color: 'green'}}>
          {time.next_stop || time.terminal ? `Ferry to ${time.next_stop || time.terminal}` : 'Ferry'}
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
      <div className="time">
        <b className="circle" style={{backgroundColor: time.color}}>
          {time.route_id}
        </b>
        &nbsp;
        &nbsp;
        {time.source === 'ferry' ? (
          <div className="ferry-display">
            <div className="ferry-main">
              <span className='bannertext' style={{color: 'green'}}>
                {time.direction === 'O' || time.direction === 'E' ? 'Out' : 'In'}
              </span>
              &nbsp;
              <span className='bannertext' style={{color: '#E13102'}}>
                {timeDisplay}
              </span>
            </div>
            {(time.next_stop || time.terminal) && (
              <div className="ferry-dest">
                To {time.next_stop || time.terminal}
              </div>
            )}
          </div>
        ) : (
          <>
            {getDirectionDisplay()}
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            <span className='bannertext' style={{color: '#E13102'}}>
              {timeDisplay}
            </span>
          </>
        )}
      </div>
      <br></br>
      <br></br>

    </div>
	);
};

export default Time;