import React, { Component } from 'react';
import { Fetch } from 'react-request';

class App extends Component {
  render() {
    return (
      <Fetch
        url="https://jsonplaceholder.typicode.com/posts/1"
        method="patch">
        {({ fetching, error, data, doFetch }) => (
          <div>
            <button
              onClick={() =>
                doFetch({
                  body: this.getUpdatedPost()
                })
              }
              disabled={fetching}>
              Update Post 1
            </button>
            {fetching && 'Saving post 1...'}
            {error && 'There was a network error'}
          </div>
        )}
      </Fetch>
    );
  }

  getUpdatedPost() {
    return JSON.stringify({
      title: 'hello'
    });
  }
}

export default App;
