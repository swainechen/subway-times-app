import React from 'react';

const Time = ({time}) => {
	const time_in_seconds = Math.round(time/60);
	return(
		<li>
			{time_in_seconds} mins
		</li>
	);
};

export default Time;