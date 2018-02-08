import React, { Component } from 'react';
import { Fetch } from 'react-request';

const urlOne = 'https://jsonplaceholder.typicode.com/posts/1';
const urlTwo = 'https://jsonplaceholder.typicode.com/posts/2';

class App extends Component {
  render() {
    // Open DevTools to observe that only one request is made for each URL
    return (
      <div>
        <Fetch url={urlOne} />
        <Fetch url={urlOne} />
        <Fetch url={urlOne} />
        <Fetch url={urlOne} />
        <Fetch url={urlOne} />

        <Fetch url={urlTwo} />
        <Fetch url={urlTwo} />
        <Fetch url={urlTwo} />
        <Fetch url={urlTwo} />
        <Fetch url={urlTwo} />

        <div>
          Open the Network tab within DevTools to see the number of requests
          that are sent off.
        </div>
      </div>
    );
  }
}

export default App;
