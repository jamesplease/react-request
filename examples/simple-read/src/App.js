import React, { Component } from 'react';
import { Fetch } from 'react-request';

class App extends Component {
  render() {
    return (
      <Fetch url="https://jsonplaceholder.typicode.com/posts/1">
        {({ fetching, failed, data }) => (
          <div>
            {fetching && 'Loading...'}
            {failed && 'There was some kind of error'}
            {data && (
              <div>
                <h1>Post title: {data.title}</h1>
                <h2>Post ID: {data.id}</h2>
              </div>
            )}
          </div>
        )}
      </Fetch>
    );
  }
}

export default App;
