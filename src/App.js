import './App.css';
import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Button, Container, TextField} from '@material-ui/core';
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import MuiAlert from '@material-ui/lab/Alert';

var client;
function App() {
  const [tweet, setTweet] = useState([])
  const [validationMessages, setValidationMessages] = useState([])
  const [timeMarkers, setTimeMarkers] = useState({})
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
      const data = JSON.parse(e.data)
      if (data.action === 'tweetRequest') {
        const found = findById(data.id)
        if (found.length === 0) {
          let newTweet = [...tweet]
          newTweet.push({id: data.id, thumb: data.thumb})
          setTweet(t => [...t, ...newTweet])
        }
      }
    };

  }, [W3CWebSocket]);


  const saveReplay = () => {
    let data = JSON.stringify({action: "saveReplay"});
    client.send(data);
  }

  const saveVideo = () => {
    let data = JSON.stringify({action: "saveVideo"});
    client.send(data);
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
      if (t[0].text && t[0].text.trim() !== '') {
        let data = JSON.stringify({action: action, id: t[0].id, text: t[0].text, in_point: t[0].in_point, out_point: t[0].out_point});
        client.send(data);
        clearTweet(myId);
      } else {
        setValidationMessages(messages => {
          const newMessages = [...messages]
          newMessages[myId] = 'Enter a title';
          return newMessages
        })
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
  }
  const setIn = (id, e) => {
    if (id in timeMarkers) {
      setTweet(old => {
        return old.map(t => {
          if (t.id === id) {
            t.in_point = timeMarkers[id]
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
            t.out_point = timeMarkers[id]
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
          t.in_point = undefined
          t.out_point = undefined
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
        <TableBody>
      {
        tweet.map(t => (
      <>
        <TableRow key={`row-${t.id}`}>
          <TableCell>
            <TextField key={`textfield-${t.id}`} className={classes.root} fullWidth label="Video title" variant="outlined" onChange={(e) => updateText(t.id, e.target.value)}  />
            {validationMessages[t.id] && <MuiAlert severity="error">{validationMessages[t.id]}</MuiAlert>}
            {t.id}
          </TableCell>
          <TableCell>
            <video width="320" height="180" onTimeUpdate={e => onTimeUpdate(t.id, e)} controls muted>
              <source src={t.thumb} type="video/mp4"/>
              Your browser does not support the video tag.
            </video>
            <div>
            <Button size="small" variant={"outlined"} onClick={e => setIn(t.id, e)}>In {t.in_point}</Button>
            <Button size="small" variant={"outlined"}  onClick={e => setOut(t.id, e)}>Out {t.out_point}</Button>
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
        </TableBody>
      </Table>
      </Container>
  );
}

export default App;
