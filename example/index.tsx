import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import CatalystChat from '../dist/index';
import Draggable from 'react-draggable'; 

const App = () => {

  return (
    <>
      <GeneralTest />
      {/* <HoursTest /> */}
    </>
  );
};

const GeneralTest = () => {
  return (
    <CatalystChat
      room={'testRoom'}
      appId={'testUid'}
      // dark={true}
      audioOnDefault={false}
      // name={(Math.random() * 1000).toString().slice(0, 4)}
      theme={{
        primary: '#50c878',
        primaryDark: '#50c878',
      }}
      onEndCall={() => console.log('end')}
    />
  );
};


const HoursTest = () => {
  const [showVideoCall, setShowVideoCall] = React.useState(true);
  
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'white',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <button
        style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 10000 }}
        onClick={() => setShowVideoCall(!showVideoCall)}
      >
        Toggle
      </button>
      <img
        // src="https://user-images.githubusercontent.com/47064842/126739397-a87e0fa1-46c8-4920-91c7-5f1ff9924048.png"
        src="https://user-images.githubusercontent.com/47064842/126837587-6d0eb1cd-4ea6-4c99-88e6-c5e6b382f78a.png"
        alt="hours"
        style={{
          height: '100%',
          width: '100%',
        }}
      />{' '}
      {showVideoCall && (
        <Draggable bounds="parent">
          <div
            style={{
              width: '40vw',
              height: '60vh',
              bottom: '40px',
              right: '40px',
              position: 'absolute',
              overflow: 'hidden',
              borderRadius: 8,
            }}
          >
            <CatalystChat
              room={'testRoom'}
              appId={'testUid'}
              dark={true}
              audioOnDefault={false}
              theme={{
                primary: '#50c878',
                primaryDark: '#50c878',
              }}
              onEndCall={() => setShowVideoCall(false)}
            />
          </div>
        </Draggable>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
