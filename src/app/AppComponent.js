import { PHChat } from '../PHChat/components/PHChat';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import React from 'react';
import { Provider } from 'react-redux';

export class App extends React.Component {
  render() {
    return (
      <React.Fragment>
        {/* <Provider store={store}> */}
          <ConfigProvider locale={enUS}>
            <PHChat />
          </ConfigProvider>
        {/* </Provider> */}
      </React.Fragment>
    );
  }
}
