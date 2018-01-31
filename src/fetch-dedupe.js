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

export default function fetchDedupe(
  input,
  init,
  { requestKey, responseType, dedupe = true }
) {
  let proxyReq;
  if (dedupe) {
    if (!requests[requestKey]) {
      requests[requestKey] = [];
    }

    const handlers = requests[requestKey];
    const requestInFlight = Boolean(handlers.length);
    const requestHandler = {};
    proxyReq = new Promise((resolve, reject) => {
      requestHandler.resolve = resolve;
      requestHandler.reject = reject;
    });

    handlers.push(requestHandler);

    if (requestInFlight) {
      return proxyReq;
    }
  }

  const request = fetch(input, init).then(
    res => {
      // The response body is a ReadableStream. ReadableStreams can only be read a single
      // time, so we must handle that in a central location, here, before resolving
      // the fetch.
      res[responseType]().then(data => {
        res.data = data;

        if (dedupe) {
          resolveRequest({ requestKey, res });
        } else {
          return res;
        }
      });
    },
    err => {
      if (dedupe) {
        resolveRequest({ requestKey, err });
      } else {
        return err;
      }
    }
  );

  if (dedupe) {
    return proxyReq;
  } else {
    return request;
  }
}
