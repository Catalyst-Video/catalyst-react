import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import VideoChat from '../dist/index';
import { toast } from 'react-toastify';

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'red' }}>
      <div
        style={{
          width: '70vw',
          height: '70vh',
          top: '50px',
          left: '50px',
          position: 'absolute',
        }}
      >
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
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
