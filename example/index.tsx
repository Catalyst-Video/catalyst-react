import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import VideoChat from '../dist/index';
import { toast } from 'react-toastify';

const App = () => {
  const [on, setOn] = React.useState(true);

  return (
    <>
      <button
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 10000 }}
        onClick={() => setOn(!on)}
      >
        toggle on
      </button>
      {on ? (
        // <div style={{ width: '100vw', height: '100vh', background: 'red' }}>
        //   <div
        //     style={{
        //       width: '70vw',
        //       height: '70vh',
        //       top: '50px',
        //       left: '50px',
        //       position: 'absolute',
        //     }}
        //   >
        <VideoChat
          sessionKey="TestingGround"
          uniqueAppId="demo"
          defaults={{
            audioOn: false,
            videoOn: false,
            // showChatArea: true,
            // showToastArea: false,
          }}
          onAddPeer={() => console.log('peer added')}
          onStartCall={() => console.log('on start call')}
          onRemovePeer={() => console.log('on remove peer')}
          onEndCall={() => toast('Triggered end call')}
          // cstmWelcomeMsg={
          //   <>
          //     <span>Room ready! Waiting for others to join with session key </span>
          //     <strong>{'Bob'}</strong>
          //   </>
          // }
          // themeColor="indigo"
          // cstmOptionBtns={[
          //   <div className="ct-btn-container">
          //     <button
          //       className="ct-hover-btn ct-tooltip ct-not-selectable"
          //       onClick={() => console.log('call ended')}
          //     >
          //       <FontAwesomeIcon icon={faSync} />
          //       <span>Synchronize</span>
          //     </button>
          //   </div>,
          // ]}
        />
      ) : (
        //   </div>
        // </div>
        <div>Off</div>
      )}
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
