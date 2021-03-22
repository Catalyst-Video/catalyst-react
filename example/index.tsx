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
        sessionKey="testKey"
        uniqueAppId="demo"
        defaults={{
          audioOn: true,
          videoOn: true,
          showCaptionsArea: false,
          showChatArea: false,
        }}
        // themeColor="indigo"
        // cstmOptionBtns={[
        //   <div className="buttonContainer">
        //     <button
        //       className="hoverButton tooltip notSelectable"
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
