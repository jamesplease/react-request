import React, { Component } from 'react';
import { Fetch } from 'react-request';

class App extends Component {
  render() {
    return (
      <Fetch
        url="https://jsonplaceholder.typicode.com/posts/1"
        lazy
        render={({ loading, error, data, fetch }) => (
          <div>
            <button onClick={() => fetch()} disabled={loading}>
              Fetch Post 1
            </button>
            {loading && 'Loading...'}
            {error && 'There was a network error'}
            {!loading &&
              !error && (
                <div>
                  <h1>Post title: {data.title}</h1>
                  <h2>Post ID: {data.id}</h2>
                </div>
              )}
          </div>
        )}
      />
    );
  }
}

export default App;
