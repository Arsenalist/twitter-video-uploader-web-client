import './App.css';
import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Button, Container, TextField} from '@material-ui/core';
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import MuiAlert from '@material-ui/lab/Alert';
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";

var client;
function App() {
  const [tweet, setTweet] = useState([])
  const [validationMessages, setValidationMessages] = useState([])
  const [timeMarkers, setTimeMarkers] = useState({})
  const [infoMessages, setInfoMessages] = useState([])
  const [status, setStatus] = useState("")

  const useStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  }));

  useEffect(() => {
    var W3CWebSocket = require('websocket').w3cwebsocket;
    client = new W3CWebSocket('ws://localhost:8888/', 'echo-protocol');

    client.onerror = function() {
      console.log("error")
      setStatus('Error')
    };

    client.onopen = function() {
      console.log("open")
      setStatus('Connected')
    };

    client.onclose = function() {
      console.log("close")
      setStatus('Closed')
    };

    client.onmessage = function(e) {
      console.log("onmessage", e.data)
      const data = JSON.parse(e.data)
      if (data.action === 'videoInfoRequest') {
        const found = findById(data.id)
        if (found.length === 0) {
          let newTweet = [...tweet]
          newTweet.push({id: data.id, thumb: data.thumb})
          setTweet(t => [...t, ...newTweet])
        }
      } else if (data.action === 'infoMessage') {
          setInfoMessages(m => {
            let newMessages = [...m]
            const {message} = data;
            newMessages.unshift(message);
            console.log("new message: ", newMessages)
            return newMessages
          })
      }
    };

  }, []);


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
        let data = JSON.stringify({action: action, id: t[0].id, text: t[0].text, in_point: t[0].in_point, out_point: t[0].out_point, tag: t[0].tag});
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


  function updateTag(id, value) {
    setTweet(old => {
      return old.map(t => {
        if (t.id === id) {
          t.tag = value
        }
        return t
      })
    })
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
      <Container maxWidth={"xl"}>
      <Grid container spacing={15}>
        <Grid spacing={3} component={Paper} item xs={9} className={classes.root}>
        <div id="status">{status}</div>
      <Button color={"primary"} variant={"contained"} onClick={() => saveReplay()}>Save Replay</Button>
      <Button color={"primary"} variant={"contained"} onClick={() => saveVideo()}>Save Video</Button>
      <Table>
        <TableBody key={"videos"}>
      {
        tweet.map(t => (
      <>
        <TableRow key={`row-${t.id}`}>
          <TableCell>
            <TextField key={`tag-${t.id}`} className={classes.root} fullWidth label="Video tag" variant="outlined" onChange={(e) => updateTag(t.id, e.target.value)}  />
            Prefixed to file name for easier identification
          </TableCell>
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
            <Button  className={classes.root}  size="small" color={"primary"} variant={"contained"}  onClick={() => processVideo(t.id, 'saveAndSendToYouTube')}>Send to YouTube</Button>
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
      </Grid>
        <Grid spacing={3} component={Paper} item xs={3} className={classes.root}>
          <List dense={true}>
            {infoMessages.map(m =>
                <ListItem>
                  <ListItemText primary={m} />
                </ListItem>
            )}
          </List>
        </Grid>
      </Grid>
      </Container>
  );
}

export default App;
