import './App.css';
import {useState, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles';



import React from 'react';
import { Button, TextField, Container, Card, Divider } from '@material-ui/core';

function App() {
  const useStyles = makeStyles((theme) => ({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  }));

  const [tweet, setTweet] = useState([])
  const [delay, setDelay] = useState(0)
  var W3CWebSocket = require('websocket').w3cwebsocket;

  var client = new W3CWebSocket('ws://192.168.86.24:8888/', 'echo-protocol');
  client.onerror = function() {
    console.log('Connection Error');
  };

  client.onopen = function() {
    console.log('WebSocket Client Connected');
  };

  client.onclose = function() {
    console.log('echo-protocol Client Closed');
  };

  client.onmessage = function(e) {
    const data = JSON.parse(e.data)
    console.log(data)
    if (data.action === 'tweetRequest') {
      tweet.push({id: data.id})
      setTweet([...tweet])
    }
  };
  console.log("client after ons", client)



  const saveVideo = () => {
    setTimeout(()=> {
      let data = JSON.stringify({action: "saveVideo"});
      client.send(data);
    }, delay * 1000)
  }

  const sendTweet = (myId) => {
    const t = tweet.filter(t => t.id === myId)
    if (t.length !== 0) {
      let data = JSON.stringify({action: "sendTweet", id: t[0].id, text: t[0].text});
      console.log(data)
      client.send(data);
    }
  }

  const clearTweet = (myId) => {
    const t = tweet.filter(t => t.id !== myId)
    setTweet(t)
  }


  function updateText(id, value) {
    const t = tweet.filter(t => t.id === id)
    if (t.length !== 0) {
      t[0].text = value
    }
    setTweet(tweet)
  }
  const classes = useStyles();
  return (
      <Container maxWidth="sm" className={classes.root}>
        <TextField className={classes.root} fullWidth label="Delay" variant="outlined" onChange={(e) => setDelay(e.target.value)}  />

      <Button color={"primary"} variant={"contained"} onClick={() => saveVideo()}>Save Video</Button>
      {
        tweet.map(t => (
            <Card variant={"elevation"} className={classes.root}>
              <TextField className={classes.root} fullWidth label="Tweet" variant="outlined" onChange={(e) => updateText(t.id, e.target.value)}  />
              <Button  className={classes.root}  color={"primary"} variant={"contained"}  onClick={() => sendTweet(t.id)}>Send Tweet</Button>
              <Button  className={classes.root}  color={"primary"} variant={"outlined"}  onClick={() => clearTweet(t.id)}>Clear</Button>
            </Card>
        ))
      }
      </Container>
  );
}

export default App;
