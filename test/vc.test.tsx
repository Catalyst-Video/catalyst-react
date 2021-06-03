import * as React from 'react';
import * as ReactDOM from 'react-dom';
import VideoChat from '../src/index';
// import { render, fireEvent } from '@testing-library/react';

describe('testMount', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<VideoChat sessionKey="test" uniqueAppId="test" />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
