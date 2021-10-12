import './App.css';
import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Button, Container, TextField} from '@material-ui/core';
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
var client;
function App() {
  const [tweet, setTweet] = useState([])
  const [timeMarkers, setTimeMarkers] = useState({})
  const [delay] = useState(0)
  const [status, setStatus] = useState("")

  const useStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  }));

  var W3CWebSocket = require('websocket').w3cwebsocket;

  useEffect(() => {
    client = new W3CWebSocket('ws://localhost:8888/', 'echo-protocol');

    client.onerror = function() {
      setStatus('Error')
    };

    client.onopen = function() {
      setStatus('Connected')
    };

    client.onclose = function() {
      setStatus('Closed')
    };

    client.onmessage = function(e) {
      console.log("raw message: ", e.data)
      const data = JSON.parse(e.data)
      console.log("new message: ", data)
      if (data.action === 'tweetRequest') {
        const found = findById(data.id)
        if (found.length === 0) {
          let newTweet = [...tweet]
          newTweet.push({id: data.id, thumb: data.thumb})
          setTweet(t => [...t, ...newTweet])
        }
      }
    };

  }, []);


  const saveReplay = () => {
    setTimeout(()=> {
      let data = JSON.stringify({action: "saveReplay"});
      client.send(data);
    }, delay * 1000)
  }

  const saveVideo = () => {
    setTimeout(()=> {
      let data = JSON.stringify({action: "saveVideo"});
      client.send(data);
    }, delay * 1000)
  }

  function findById(myId) {
    return tweet.filter(t => t.id === myId)
  }

  const clearVideo = (myId) => {
    let data = JSON.stringify({action: 'clearVideo', id: myId});
    client.send(data);
    clearTweet(myId);
  }

  const processVideo = (myId, action) => {
    const t = findById(myId);
    if (t.length !== 0) {
      if (t[0].text) {
        let data = JSON.stringify({action: action, id: t[0].id, text: t[0].text, in_point: t[0].in, out_point: t[0].out});
        client.send(data);
        clearTweet(myId);
      }

    }
  }

  const clearTweet = (myId) => {
    setTweet(old => old.filter(t => t.id !== myId))
  }


  function updateText(id, value) {
    setTweet(old => {
      return old.map(t => {
        if (t.id === id) {
          t.text = value
        }
        return t
      })
    })
  }
  const onTimeUpdate = (id, e) => {
    setTimeMarkers(t => {
      const newTimeMarker = {...t}
      newTimeMarker[id] = e.target.currentTime
      return newTimeMarker
    })
    console.log(timeMarkers)
  }
  const setIn = (id, e) => {
    if (id in timeMarkers) {
      setTweet(old => {
        return old.map(t => {
          if (t.id === id) {
            t.in = timeMarkers[id]
          }
          return t
        })
      })
    }
  }
  const setOut = (id, e) => {
    if (id in timeMarkers) {
      setTweet(old => {
        return old.map(t => {
          if (t.id === id) {
            t.out = timeMarkers[id]
          }
          return t
        })
      })
    }

  }
  const clear = (id, e) => {
    setTweet(old => {
      return old.map(t => {
        if (t.id === id) {
          t.in = undefined
          t.out = undefined
        }
        return t
      })
    })
  }
  const classes = useStyles();
  return (
      <Container maxWidth="lg" className={classes.root}>
        <div id="status">{status}</div>
      <Button color={"primary"} variant={"contained"} onClick={() => saveReplay()}>Save Replay</Button>
        <Button color={"primary"} variant={"contained"} onClick={() => saveVideo()}>Save Video</Button>
      <Table>
      {
        tweet.map(t => (
      <>
        <TableRow>
          <TableCell>
            <TextField key={`textfield-${t.id}`} className={classes.root} fullWidth label="Video title" variant="outlined" onChange={(e) => updateText(t.id, e.target.value)}  />
            {t.id}
          </TableCell>
          <TableCell>
            <video width="320" height="180" onTimeUpdate={e => onTimeUpdate(t.id, e)} controls muted>
              <source src={t.thumb} type="video/mp4"/>
              Your browser does not support the video tag.
            </video>
            <div>
            <Button size="small" variant={"outlined"} onClick={e => setIn(t.id, e)}>In {t.in}</Button>
            <Button size="small" variant={"outlined"}  onClick={e => setOut(t.id, e)}>Out {t.out}</Button>
            <Button size="small" variant={"outlined"}  onClick={e => clear(t.id, e)}>Clear</Button>
            </div>
          </TableCell>
          <TableCell>
            <Button  className={classes.root}  size="small" color={"primary"} variant={"contained"}  onClick={() => processVideo(t.id, 'saveAndSendTweet')}>Send Tweet</Button>
          </TableCell>
          <TableCell>
            <Button  className={classes.root}  size="small" color={"primary"} variant={"outlined"}  onClick={() => processVideo(t.id, 'saveVideoWithNameOnly')}>Save</Button>
          </TableCell>
          <TableCell>
            <Button  className={classes.root}  size="small" color={"primary"} variant={"outlined"}  onClick={() => clearVideo(t.id)}>Clear</Button>
          </TableCell>
        </TableRow>
</>

        ))
      }
      </Table>
      </Container>
  );
}

export default App;
