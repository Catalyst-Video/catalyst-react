import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import CatalystChat from '../dist/index';

const App = () => {
  const [showVideoCall, setShowVideoCall] = React.useState(true);

  return (
    <>
      {/* <button
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 10000 }}
        onClick={() => setShowVideoCall(!showVideoCall)}
      >
        toggle on
      </button> */}
      {showVideoCall ? (
        <WrapperComp
          sessionKey="TestingGround"
          setShowVideoCall={setShowVideoCall}
        />
      ) : (
        ''
      )}
    </>
  );
};

const WrapperComp = ({
  sessionKey,
  setShowVideoCall,
}: {
  sessionKey: string;
  setShowVideoCall: Function;
}) => {
  return (
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
    <CatalystChat
      sessionKey={sessionKey}
      uniqueAppId="demo1"
      // disableSetupRoom={true}
      defaults={{
        audioOn: true,
        videoOn: true,
        showChatArea: false,
      }}
      showSetNameBox={true}
      name={'USER_NAME'}
      // disableLocalVidDrag={true}
      // alwaysBanner={true}
      onAddPeer={() => console.log('peer added')}
      onStartCall={() => console.log('on start call')}
      onRemovePeer={() => console.log('on remove peer')}
      onEndCall={() => setShowVideoCall(false)}
      onSubmitLog={log => {
        console.log('received: ' + log);
      }}
      themeColor="cyan"
      hidden={{ chat: true }}
      //  darkModeDefault={true}
      // disableRedIndicators={false}
      // darkModeDefault={true}
      // cstmOptionBtns={[
      //   {
      //     id: 'test',
      //     tooltip: 'Terms of Service',
      //     onClick: () => {
      //       window.open('https://readtogetheronline.com/tos/', '_blank');
      //     },
      //     fontAwesomeIcon: ['fas', 'info-circle'],
      //   },
      // ]}
      // cstmWelcomeMsg={
      //   <>
      //     <span>Room ready! Waiting for others to join with session key </span>
      //     <strong>{'Bob'}</strong>
      //   </>
      // }
      // themeColor="green"
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
    //   </div>
    // </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
