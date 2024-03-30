import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Logger } from 'react-logger-lib';

import Time from './components/Time';
import processService from './services/objToArray';

const App = () => {
  const [stops, setStops] = useState([]);
  const [tresult1, setResult1] = useState([]);
  const [tresult2, setResult2] = useState([]);
  const [tresult3, setResult3] = useState([]);
  const [url1, setUrl1] = useState('/api/train_times/157');
  const [url2, setUrl2] = useState('');
  const [url3, setUrl3] = useState('/api/train_times/283');
  const timerIdRef1 = useRef(null);
  const timerIdRef2 = useRef(null);
  const timerIdRef3 = useRef(null);
  Logger.of('App.App.main').info('entry');

  const updateTimes1 = async () => {
    Logger.of('App.App.updateTimes1').info('entry');
    console.log(`UPDATE FUNCTION 1: ${url1}`);
    if (url1 !== '') {
      let tresult1 = await axios.get(url1);
      tresult1 = processService.processApiObj(tresult1);
      tresult1 = tresult1[0].trains;

      const routeIds = tresult1.map(time => time.route_id)

      let colors = await axios.get('/api/routes/');
      colors = colors.data;
    
      tresult1 = tresult1.map(time => time={...time, color: colors.find(color => color.route_id === time.route_id).color});
      setResult1(tresult1);
    }
  };

  const updateTimes2 = async () => {
    Logger.of('App.App.updateTimes2').info('entry');
    console.log(`UPDATE FUNCTION 2: ${url2}`);
    if (url2 !== '') {
      let tresult2 = await axios.get(url2);
      tresult2 = processService.processApiObj(tresult2);
      tresult2 = tresult2[0].trains;

      const routeIds = tresult2.map(time => time.route_id)

      let colors = await axios.get('/api/routes/');
      colors = colors.data;
    
      tresult2 = tresult2.map(time => time={...time, color: colors.find(color => color.route_id === time.route_id).color});
      setResult2(tresult2);
    }
  };

  const updateTimes3 = async () => {
    Logger.of('App.App.updateTimes3').info('entry');
    console.log(`UPDATE FUNCTION 3: ${url3}`);
    if (url3 !== '') {
      let tresult3 = await axios.get(url3);
      tresult3 = processService.processApiObj(tresult3);
      tresult3 = tresult3[0].trains;

      const routeIds = tresult3.map(time => time.route_id)

      let colors = await axios.get('/api/routes/');
      colors = colors.data;
    
      tresult3 = tresult3.map(time => time={...time, color: colors.find(color => color.route_id === time.route_id).color});
      setResult3(tresult3);
    }
  };

  const startPolling1 = () => {
    timerIdRef1.current = setInterval(updateTimes1, 30000);
    console.log(`starting timer1: ${timerIdRef1.current}`);
  };

  const stopPolling1 = (Id) => {
    console.log(`clearing timer1: ${timerIdRef1.current}`);
    clearInterval(timerIdRef1.current)
  };

  const startPolling2 = () => {
    timerIdRef2.current = setInterval(updateTimes2, 30000);
    console.log(`starting timer2: ${timerIdRef2.current}`);
  };

  const stopPolling2 = (Id) => {
    console.log(`clearing timer2: ${timerIdRef2.current}`);
    clearInterval(timerIdRef2.current)
  };

  const startPolling3 = () => {
    timerIdRef3.current = setInterval(updateTimes3, 30000);
    console.log(`starting timer3: ${timerIdRef3.current}`);
  };


  const getStopInfo1 = (selectedStop) => {
    Logger.of('App.App.getStopInfo').info('entry');
    console.log(`SELECTEDSTOP: ${selectedStop.value}`);
    stopPolling1()
    const url_inner = '/api/train_times/' + selectedStop.value;
    console.log(`current timer: ${timerIdRef1.current}`);
    console.log(`setting url1 to: ${url_inner}`);
    setUrl1(url_inner)
  };

  const getStopInfo2 = (selectedStop) => {
    Logger.of('App.App.getStopInfo').info('entry');
    console.log(`SELECTEDSTOP: ${selectedStop.value}`);
    stopPolling2()
    const url_inner = '/api/train_times/' + selectedStop.value;
    console.log(`current timer: ${timerIdRef2.current}`);
    console.log(`setting url2 to: ${url_inner}`);
    setUrl2(url_inner)
  };

  useEffect(() => {
    if (url3 !== '') {
      console.log(`have url3 as: ${url3}`);
      startPolling3()
    }
  }, [url3]);

  useEffect(() => {
    if (url1 !== '') {
      console.log(`have url1 as: ${url1}`);
      startPolling1()
    }
  }, [url1]);

  useEffect(() => {
    if (url2 !== '') {
      console.log(`have url2 as: ${url2}`);
      startPolling2()
    }
  }, [url2]);


  useEffect(() => {
    axios.get('/api/stations/')
         .then(stops_list => processService.processApiObj(stops_list))
         .then(stops_list => stops_list.map(
                (stop => {
                    return { 
                    value: stop.station_id, 
                    label: stop.name,
                    }
                  }
                )
              ))
          .then(results => {setStops(results)});
  }, []);

  useEffect(() => {
    if (stops !== []) {
      const logval = stops.find((i) => i.label === 'Grand Central-42 St');
      if (logval != null) {
        console.log(`grand central level: ${logval.value}`);
      };
    };
  }, []);

  return (
    <div>
      <h1 class='center'><i>Transit Hub</i></h1>
    <table width="90%"><tbody><tr><td valign="top" width="30%">
      <div>
        Station 1
      </div>
      <ol>
        {
        tresult1 === [] ?
        <div>No trains running at this station.</div> :
          tresult1.map((time, i) =>
          <Time key={i} time={time} />
          )
        }
      </ol>
    </td><td valign="top" width="30%">
      <div>
        Station 2 - this still implements a select
        <Select
          options={stops}
          onChange={opt => getStopInfo2(opt)}
        />
      </div>
      <ol>
        {
        tresult2 === [] ?
        <div>No trains running at this station.</div> :
          tresult2.map((time, i) =>
          <Time key={i} time={time} />
          )
        }
      </ol>
    </td><td valign="top" width="30%">
      <div>
        Station 3
      </div>
      <ol>
        {
        tresult3 === [] ?
        <div>No trains running at this station.</div> :
          tresult3.map((time, i) =>
          <Time key={i} time={time} />
          )
        }
      </ol>
    </td></tr></tbody></table>
    
    </div>
  )
};

export default App;
