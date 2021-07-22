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
    <CatalystChat room={'test'} appId={'example'} dark={false} />
    //   </div>
    // </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
