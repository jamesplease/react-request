import React, { Component } from 'react';
import Composer from 'react-composer';
import { Fetch } from 'react-request';

class App extends Component {
  render() {
    return (
      <Composer
        components={[
          <Fetch url="https://jsonplaceholder.typicode.com/posts/1" lazy />,
          <Fetch url="https://jsonplaceholder.typicode.com/posts/2" lazy />,
          <Fetch
            url="https://jsonplaceholder.typicode.com/posts/1"
            method="delete"
          />
        ]}>
        {([readPostOne, readPostTwo, deletePostOne]) => (
          <div>
            <button
              onClick={() => deletePostOne.doFetch()}
              disabled={deletePostOne.fetching}>
              Delete Post One
            </button>
            <button onClick={() => readPostOne.doFetch()}>Fetch Post 1</button>
            <button onClick={() => readPostTwo.doFetch()}>Fetch Post 2</button>
            {readPostOne.fetching && 'Fetching post 1...'}
            {!readPostOne.fetching && 'Not currently fetching post 1.'}
            {readPostTwo.fetching && 'Fetching post 2...'}
            {!readPostTwo.fetching && 'Not currently fetching post 2.'}
          </div>
        )}
      </Composer>
    );
  }
}

export default App;
