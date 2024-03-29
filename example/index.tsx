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
      room="testingGround"
      appId={process.env.REACT_APP_APP_ID ?? 'REAL_APP_ID_HERE'}
      audioOffDefault
      // videoOffDefault
      disableSetupView
      onJoinCall={() => console.log('onJoinCall')}
      onMemberJoin={() => console.log('onmemjoin')}
      onMemberLeave={() => console.log('onmemleave')}
      handleUserData={data => console.log('handleUserData', data)}
      // cstmWelcomeMsg="Hi"
      // cstmSupportUrl=""
      // name={(Math.random() * 1000).toString().slice(0, 4)}
      // theme={{
      //   primary: '#11c1e8',
      //   secondary: '#374151',
      //   tertiary: '#4B5563',
      //   quaternary: '#6B7280',
      // }}
      // theme='hoursLight'
      // name={'bob'}
      // theme={ }
      onLeaveCall={() => console.log('end')}
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
              width: '450px',
              height: '450px',
              bottom: '40px',
              right: '40px',
              position: 'absolute',
              overflow: 'hidden',
              borderRadius: 8,
            }}
          >
            <CatalystChat
              room={'testingGround'}
              appId={process.env.REACT_APP_APP_ID ?? 'REAL_APP_ID_HERE'}
              audioOffDefault
              disableSetupView
              disableChat
              theme="hoursDark"
              onLeaveCall={() => setShowVideoCall(false)}
            />
          </div>
        </Draggable>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
