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
  const [delay, setDelay] = useState(0)
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

  }, []);


  const saveVideo = () => {
    setTimeout(()=> {
      let data = JSON.stringify({action: "saveVideo"});
      client.send(data);
    }, delay * 1000)
  }

  function findById(myId) {
    return tweet.filter(t => t.id === myId)
  }

  const processVideo = (myId, action) => {
    const t = findById(myId);
    if (t.length !== 0) {
      if (t[0].text) {
        let data = JSON.stringify({action: action, id: t[0].id, text: t[0].text});
        client.send(data);
        clearTweet(myId);
      }
    }
  }

  const clearTweet = (myId) => {
    setTweet(old => tweet.filter(t => t.id !== myId))
  }


  function updateText(id, value) {
    console.log("update text", id, value)
    setTweet(old => {
      return old.map(t => {
        if (t.id === id) {
          t.text = value
        }
        return t
      })
    })
  }
  const classes = useStyles();
  return (
      <Container maxWidth="lg" className={classes.root}>
        <div id="status">{status}</div>
      <Button color={"primary"} variant={"contained"} onClick={() => saveVideo()}>Save Video</Button>
      <Table>
      {
        tweet.map(t => (
      <>
        <TableRow>
          <TableCell>
            <TextField className={classes.root} fullWidth label="Video title" variant="outlined" onChange={(e) => updateText(t.id, e.target.value)}  />
            {t.id}
          </TableCell>
          <TableCell>
            <video width="320" height="180" controls muted>
              <source src={t.thumb} type="video/mp4"/>
              Your browser does not support the video tag.
            </video>
          </TableCell>
          <TableCell>
            <Button  className={classes.root}  size="small" color={"primary"} variant={"contained"}  onClick={() => processVideo(t.id, 'saveAndSendTweet')}>Send Tweet</Button>
          </TableCell>
          <TableCell>
            <Button  className={classes.root}  size="small" color={"primary"} variant={"outlined"}  onClick={() => processVideo(t.id, 'saveVideoWithNameOnly')}>Save</Button>
          </TableCell>
          <TableCell>
            <Button  className={classes.root}  size="small" color={"primary"} variant={"outlined"}  onClick={() => clearTweet(t.id)}>Clear</Button>
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
