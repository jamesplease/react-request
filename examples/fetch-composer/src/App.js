import React, { Component } from 'react';
import { Fetch, FetchComposer } from 'react-request';

class App extends Component {
  render() {
    return (
      <FetchComposer
        requests={[
          <Fetch url="https://jsonplaceholder.typicode.com/posts/1" lazy />,
          <Fetch url="https://jsonplaceholder.typicode.com/posts/2" lazy />,
          <Fetch
            url="https://jsonplaceholder.typicode.com/posts/1"
            method="delete"
          />
        ]}
        render={([readPostOne, readPostTwo, deletePostOne]) => (
          <div>
            <button
              onClick={() => deletePostOne.fetch()}
              disabled={deletePostOne.loading}>
              Delete Post One
            </button>
            <button onClick={() => readPostOne.fetch()}>Fetch Post 1</button>
            <button onClick={() => readPostTwo.fetch()}>Fetch Post 2</button>
            {readPostOne.loading && 'Fetching post 1...'}
            {!readPostOne.loading && 'Not currently fetching post 1.'}
            {readPostTwo.loading && 'Fetching post 2...'}
            {!readPostTwo.loading && 'Not currently fetching post 2.'}
          </div>
        )}
      />
    );
  }
}

export default App;
