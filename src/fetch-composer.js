import React from 'react';
import PropTypes from 'prop-types';

export default function FetchComposer({ requests = [], render }) {
  if (typeof render !== 'function') {
    return null;
  }

  // This is the argument that we pass into `render`.
  const responses = [];

  // This is the list of requests, reversed. We reverse them because the
  // Request that you list last will be the highest in the tree.
  const reversedRequests = requests.reverse();

  function chainRequests(childrenRequests) {
    // When we reach the end of our `childrenRequests`, we can render out
    // the response array.
    if (childrenRequests.length === 0) {
      return render(responses);
    }

    const requestIndex = childrenRequests.length - 1;
    const request = requests[requestIndex];

    // This is the index of where we should place the response within `responses`.
    // It's not the same as `requestIndex` because we reversed the requests when
    // rendering out the components.
    // In a sense, it can be thought of as the "reverse" index of `requestIndex`.
    const responseIndex = reversedRequests.length - childrenRequests.length;

    // We create a clone of the childrenRequests so that subsequent calls to `render`
    // render the same tree. If we modified `reversedRequests` directly, then the tree would
    // be different with each call to `render`.
    const childrenRequestsClone = [...childrenRequests];
    childrenRequestsClone.pop();

    return React.cloneElement(request, {
      render(data) {
        responses[responseIndex] = data;
        return chainRequests(childrenRequestsClone);
      }
    });
  }

  return chainRequests(reversedRequests);
}

FetchComposer.propTypes = {
  render: PropTypes.func,
  requests: PropTypes.array
};
