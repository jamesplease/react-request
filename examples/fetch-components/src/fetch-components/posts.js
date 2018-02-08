import React from 'react';
import { Fetch } from 'react-request';

// The idea behind this is to abstract away your HTTP request configuration.
// Typically, you don't want things like URLs and header configuration scattered
// throughout your app.
//
// This allows you to reuse all of that HTTP configuration in your app by
// passing the minimum amount of information necessary to make the request.
//
// In the case of this simple "post" resource, all that is needed is an ID (and
// children, since Fetch is a render prop component)
export function ReadPost({ postId, children }) {
  return (
    <Fetch
      url={`https://jsonplaceholder.typicode.com/posts/${postId}`}
      children={children}
    />
  );
}

export function UpdatePost({ postId, children }) {
  return (
    <Fetch
      method="patch"
      url={`https://jsonplaceholder.typicode.com/posts/${postId}`}
      children={children}
    />
  );
}

export function DeletePost({ postId, children }) {
  return (
    <Fetch
      method="delete"
      url={`https://jsonplaceholder.typicode.com/posts/${postId}`}
      children={children}
    />
  );
}
