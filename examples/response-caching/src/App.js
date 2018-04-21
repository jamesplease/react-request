import React, { Component, Fragment } from 'react';
import { Fetch } from 'react-request';
import { setTimeout } from 'timers';

const url = 'https://jsonplaceholder.typicode.com/posts/1';
let renderCount = 0;

class App extends Component {
  render() {
    // Open DevTools to observe that only one request is made, even though two fetch components are mounted.
    // The second component receives the data that was cached after the first Fetch's response completes.
    return (
      <div>
        <Fetch url={url} />
        {this.state.fetchAgain && (
          <Fetch url={url}>
            {stuff => {
              if (renderCount === 0) {
                console.log(
                  'The second fetch component just mounted. You should see that only one request was made in the network tab (unless your connection is really slow).',
                  stuff
                );

                renderCount++;
              }

              return null;
            }}
          </Fetch>
        )}
        <div>Check out the DevTools console to interpret this example.</div>
      </div>
    );
  }

  state = {
    fetchAgain: false
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        fetchAgain: true
      });
    }, 2000);
  }
}

export default App;
