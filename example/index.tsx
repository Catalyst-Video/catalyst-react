import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import VideoChat from '../dist/index';
// import '../dist/catalyst-vc-react.cjs.development.css';

const App = () => {
  return (
    <div>
      <VideoChat
        sessionKey="testKey"
        catalystUUID="demo"
        defaults={{
          audioOn: true,
          videoOn: true,
          hideCaptionsArea: true,
          hideChatArea: true,
        }}
        themeColor="indigo"
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
