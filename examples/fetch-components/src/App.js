import React, { Component } from 'react';
import Composer from 'react-composer';
import { ReadPost, UpdatePost, DeletePost } from './fetch-components/posts';

class App extends Component {
  render() {
    // This ID could come from, say, props
    const postId = '1';

    return (
      <Composer
        components={[
          <ReadPost postId="1" />,
          <UpdatePost postId="1" />,
          <DeletePost postId="1" />
        ]}>
        {([readPost, updatePost, deletePost]) => (
          <div>
            <div>
              <button
                onClick={() => deletePost.doFetch()}
                disabled={
                  deletePost.fetching ||
                  updatePost.fetching ||
                  readPost.fetching
                }>
                Delete Post {postId}
              </button>
              <button
                onClick={() =>
                  updatePost.doFetch({
                    body: JSON.stringify({
                      title: 'hello'
                    })
                  })
                }
                disabled={
                  deletePost.fetching ||
                  updatePost.fetching ||
                  readPost.fetching
                }>
                Update Post {postId}
              </button>
            </div>
            <div>
              {readPost.fetching && 'Loading...'}
              {readPost.failed && 'There was some kind of error'}
              {readPost.data && (
                <div>
                  <h1>Post title: {readPost.data.title}</h1>
                  <h2>Post ID: {readPost.data.id}</h2>
                </div>
              )}
            </div>
          </div>
        )}
      </Composer>
    );
  }
}

export default App;
