// This is a cache of in-flight requests. Each request key maps to an
// array of Promises. When the request resolves, each promise in the
// array is pushed to.
const requests = {};

// This loops through all of the handlers for the request and either
// resolves or rejects them.
function resolveRequest({ requestKey, res, err }) {
  const handlers = requests[requestKey];

  handlers.forEach(handler => {
    if (res) {
      handler.resolve(res);
    } else {
      handler.reject(err);
    }
  });

  // This list of handlers has been, well, handled. So we
  // clear the handlers for the next request.
  requests[requestKey] = null;
}

export default function fetchDedupe(input, init, { requestKey, contentType }) {
  if (!requests[requestKey]) {
    requests[requestKey] = [];
  }

  const handlers = requests[requestKey];
  const requestInFlight = Boolean(handlers.length);
  const requestHandler = {};
  const req = new Promise((resolve, reject) => {
    requestHandler.resolve = resolve;
    requestHandler.reject = reject;
  });

  handlers.push(requestHandler);

  if (requestInFlight) {
    return req;
  }

  fetch(input, init).then(
    res => {
      // The response body is a ReadableStream. ReadableStreams can only be read a single
      // time, so we must handle that in a central location, here, before resolving
      // the fetch.
      res[contentType]().then(data => {
        res.data = data;
        resolveRequest({ requestKey, res });
      });
    },
    err => resolveRequest({ requestKey, err })
  );

  return req;
}
