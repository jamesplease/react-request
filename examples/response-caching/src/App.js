import React, { Component } from 'react';
import { Fetch } from 'react-request';
import { setTimeout } from 'timers';

const url = 'https://jsonplaceholder.typicode.com/posts/1';

class App extends Component {
  render() {
    // Open DevTools to observe that only one request is made for each URL
    return (
      <div>
        <Fetch url={url} />
        {this.state.fetchAgain && (
          <Fetch url={url}>
            {stuff => {
              console.log(
                'Second fetch mounted; data pulled from the cache if the initial request resolved in < 2s.',
                stuff
              );
              return null;
            }}
          </Fetch>
        )}
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
