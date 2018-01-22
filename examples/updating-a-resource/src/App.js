import React, { Component } from 'react';
import { Fetch } from 'react-request';

class App extends Component {
  render() {
    return (
      <Fetch
        url="https://jsonplaceholder.typicode.com/posts/1"
        method="patch"
        render={({ loading, error, data, fetch }) => (
          <div>
            <button
              onClick={() =>
                fetch({
                  body: this.getUpdatedPost()
                })
              }
              disabled={loading}>
              Update Post 1
            </button>
            {loading && 'Saving post 1...'}
            {error && 'There was a network error'}
          </div>
        )}
      />
    );
  }
}

export default App;
