/* globals Erizo */

/* eslint-env browser */
/* eslint-disable no-param-reassign, no-console */

const serverUrl = '/';
let localStream;
let room;

function printText(text) {
  document.getElementById('messages').value += `- ${text}\n`;
}

window.onload = () => {
  const name = Math.round(Math.random()*1000);
  const config = { audio: true, video: true, data: true, videoSize: [640, 480, 640, 480],attributes: {avatar:name+"",id:name+"",actualName:"KADWEB"+name, name:"Test Connection "+name }};
  localStream = Erizo.Stream(config);
  const createToken = (userName, role, callback) => {
    const req = new XMLHttpRequest();
    const url = `${serverUrl}createToken/`;
    const body = { username: userName, role };

    req.onreadystatechange = () => {
      if (req.readyState === 4) {
        callback(req.responseText);
      }
    };

    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(body));
  };

  createToken('user', 'presenter', (response) => {
    const token = response;
    console.log(token);
    room = Erizo.Room({ token });

    localStream.addEventListener('access-denied', function(event) {
      printText("Access to webcam and/or microphone rejected");
      const subscribeToStreams = (streams) => {
        streams.forEach((stream) => {
          if (localStream.getID() !== stream.getID()) {
            room.subscribe(stream);
          }
        });
      };
      room.addEventListener('room-connected', (roomEvent) => {
        printText('Connected to the room OK');
        room.publish(localStream, { maxVideoBW: 300, handlerProfile: 0 });
        subscribeToStreams(roomEvent.streams);

      });

      room.addEventListener('stream-subscribed', (streamEvent) => {
        const stream = streamEvent.stream;
        stream.show('my_subscribed_video');
        printText('Subscribed to your local stream OK:'+stream.hasAudio()+','+stream.hasVideo()+':'+stream.getID());
      });

      room.addEventListener('stream-added', (streamEvent) => {
        printText('Local stream published OK');
        const streams = [];
        streams.push(streamEvent.stream);
        subscribeToStreams(streams);
      });

      room.addEventListener('stream-removed', (streamEvent) => {
        // Remove stream from DOM
        const stream = streamEvent.stream;
        if (stream.elementID !== undefined) {
          const element = document.getElementById(stream.elementID);
          document.body.removeChild(element);
        }
      });

      room.addEventListener('stream-failed', () => {
        console.log('STREAM FAILED, DISCONNECTION');
        printText('STREAM FAILED, DISCONNECTION');
        room.disconnect();
      });
      room.connect({ singlePC: true });
//      localStream.show('my_local_video');
      document.getElementById('my_local_video').hidden=true

    });

    localStream.addEventListener('access-accepted', () => {
      printText('Mic and Cam OK');
      const subscribeToStreams = (streams) => {
        streams.forEach((stream) => {
          if (localStream.getID() !== stream.getID()) {
            room.subscribe(stream);
          }
          else
            stream.setAttributes({name:'KKKKK',actualName: 'TEst',nickname: 'KAD'});
        });
      };

      room.addEventListener('room-connected', (roomEvent) => {
        printText('Connected to the room OK');
        room.publish(localStream, { maxVideoBW: 300, handlerProfile: 0 });
        subscribeToStreams(roomEvent.streams);
        localStream.setAttributes({name:'KKK',actualName: 'TEst',nickname: 'KAD'});
      });

      room.addEventListener('stream-subscribed', (streamEvent) => {
        printText('Subscribed to your local stream OK');
        const stream = streamEvent.stream;
        stream.show('my_subscribed_video');
        console.log('stream-subscribed:'+streamEvent.stream.getID());
      });

      room.addEventListener('stream-added', (streamEvent) => {
        printText('Local stream published OK');
        const streams = [];
        streams.push(streamEvent.stream);
        subscribeToStreams(streams);
        console.log('stream-added:'+streamEvent.stream.getID());
        printText('stream-added:'+streamEvent.stream.getID());
      });

      room.addEventListener('stream-removed', (streamEvent) => {
        // Remove stream from DOM
        const stream = streamEvent.stream;
        if (stream.elementID !== undefined) {
          const element = document.getElementById(stream.elementID);
          document.body.removeChild(element);
        }
      });

      room.addEventListener('stream-failed', () => {
        console.log('STREAM FAILED, DISCONNECTION');
        printText('STREAM FAILED, DISCONNECTION');
        room.disconnect();
      });

      room.connect();

      localStream.show('my_local_video');
    });
    localStream.init();
  });
};
