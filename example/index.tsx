import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import VideoChat from '../dist/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
// import '../dist/catalyst-vc-react.cjs.development.css';

const App = () => {
  return (
    <div>
      <VideoChat
        sessionKey="testingGround"
        uniqueAppId="demo"
        defaults={{
          audioOn: true,
          videoOn: true,
          showCaptionsArea: false,
          showChatArea: false,
        }}
        // themeColor="indigo"
        // cstmOptionBtns={[
        //   <div className="ct-button-container">
        //     <button
        //       className="hoverButton tooltip ct-not-selectable"
        //       onClick={() => console.log('call ended')}
        //     >
        //       <FontAwesomeIcon icon={faSync} />
        //       <span>Synchronize</span>
        //     </button>
        //   </div>,
        // ]}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
