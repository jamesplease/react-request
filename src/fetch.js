import React from 'react';
import PropTypes from 'prop-types';
import { getRequestKey, fetchDedupe, isRequestInFlight } from 'fetch-dedupe';

// This object is our cache
// The keys of the object are requestKeys
// The value of each key is a Response instance
let responseCache = {};

// The docs state that this is not safe to use in an
// application. That's just because I am not writing tests,
// nor designing the API, around folks clearing the cache.
// This was only added to help out with testing your app.
// Use your judgment if you decide to use this in your
// app directly.
export function clearResponseCache() {
  responseCache = {};
}

export class Fetch extends React.Component {
  render() {
    // Anything pulled from `this.props` here is not eligible to be
    // specified when calling `doFetch`.
    const { children, requestName } = this.props;
    const { fetching, response, data, error, requestKey, url } = this.state;

    if (!children) {
      return null;
    } else {
      return (
        children({
          requestName,
          url,
          fetching,
          failed: Boolean(error || (response && !response.ok)),
          response,
          data,
          requestKey,
          error,
          doFetch: this.fetchRenderProp,
        }) || null
      );
    }
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      requestKey:
        props.requestKey ||
        getRequestKey({
          ...props,
          method: props.method.toUpperCase(),
        }),
      requestName: props.requestName,
      fetching: false,
      response: null,
      data: null,
      error: null,
      url: props.url,
    };
  }

  isReadRequest = method => {
    const uppercaseMethod = method.toUpperCase();

    return (
      uppercaseMethod === 'GET' ||
      uppercaseMethod === 'HEAD' ||
      uppercaseMethod === 'OPTIONS'
    );
  };

  // We default to being lazy for "write" requests,
  // such as POST, PATCH, DELETE, and so on.
  isLazy = () => {
    const { lazy, method } = this.props;

    return typeof lazy === 'undefined' ? !this.isReadRequest(method) : lazy;
  };

  shouldCacheResponse = () => {
    const { cacheResponse, method } = this.props;

    return typeof cacheResponse === 'undefined'
      ? this.isReadRequest(method)
      : cacheResponse;
  };

  getFetchPolicy = () => {
    const { fetchPolicy, method } = this.props;

    if (typeof fetchPolicy === 'undefined') {
      return this.isReadRequest(method) ? 'cache-first' : 'network-only';
    } else {
      return fetchPolicy;
    }
  };

  componentDidMount() {
    if (!this.isLazy()) {
      this.fetchData();
    }
  }

  // Because we use `componentDidUpdate` to determine if we should fetch
  // again, there will be at least one render when you receive your new
  // fetch options, such as a new URL, but the fetch has not begun yet.
  componentDidUpdate(prevProps) {
    const currentRequestKey =
      this.props.requestKey ||
      getRequestKey({
        ...this.props,
        method: this.props.method.toUpperCase(),
      });
    const prevRequestKey =
      prevProps.requestKey ||
      getRequestKey({
        ...prevProps,
        method: prevProps.method.toUpperCase(),
      });

    if (currentRequestKey !== prevRequestKey && !this.isLazy()) {
      this.fetchData({
        requestKey: currentRequestKey,
      });
    }
  }

  componentWillUnmount() {
    this.willUnmount = true;
    this.cancelExistingRequest('Component unmounted');
  }

  // When a request is already in flight, and a new one is
  // configured, then we need to "cancel" the previous one.
  cancelExistingRequest = reason => {
    if (this.state.fetching && this._currentRequestKey !== null) {
      const abortError = new Error(reason);
      // This is an effort to mimic the error that is created when a
      // fetch is actually aborted using the AbortController API.
      abortError.name = 'AbortError';
      this.onResponseReceived({
        ...this.responseReceivedInfo,
        error: abortError,
        hittingNetwork: true,
      });
    }
  };

  fetchRenderProp = options => {
    return new Promise(resolve => {
      // We wrap this in a setTimeout so as to avoid calls to `setState`
      // in render, which React does not allow.
      //
      // tl;dr, the following code should never cause a React warning or error:
      //
      // `<Fetch children={({ doFetch }) => doFetch()} />
      setTimeout(() => {
        this.fetchData(options, true, resolve);
      });
    });
  };

  // When a subsequent request is made, it is important that the correct
  // request key is used. This method computes the right key based on the
  // options and props.
  getRequestKey = options => {
    // A request key in the options gets top priority
    if (options && options.requestKey) {
      return options.requestKey;
    }

    // Otherwise, if we have no request key, but we do have options, then we
    // recompute the request key based on these options.
    // Note that if the URL, body, or method have not changed, then the request
    // key should match the previous request key if it was computed.
    // If you passed in a custom request key as a prop, then you will also
    // need to pass in a custom key when you call `doFetch()`!
    else if (options) {
      const { url, method, body } = Object.assign({}, this.props, options);
      return getRequestKey({
        url,
        body,
        method: method.toUpperCase(),
      });
    }

    // Next in line is the the request key from props.
    else if (this.props.requestKey) {
      return this.props.requestKey;
    }

    // Lastly, we compute the request key from the props.
    else {
      const { url, method, body } = this.props;

      return getRequestKey({
        url,
        body,
        method: method.toUpperCase(),
      });
    }
  };

  fetchData = (options, ignoreCache, resolve) => {
    // These are the things that we do not allow a user to configure in
    // `options` when calling `doFetch()`. Perhaps we should, however.
    const { requestName, dedupe, beforeFetch } = this.props;

    this.cancelExistingRequest('New fetch initiated');

    const requestKey = this.getRequestKey(options);
    const requestOptions = Object.assign({}, this.props, options);

    this._currentRequestKey = requestKey;

    const {
      url,
      body,
      credentials,
      headers,
      method,
      responseType,
      mode,
      cache,
      redirect,
      referrer,
      referrerPolicy,
      integrity,
      keepalive,
      signal,
    } = requestOptions;

    const uppercaseMethod = method.toUpperCase();
    const shouldCacheResponse = this.shouldCacheResponse();

    const init = {
      body,
      credentials,
      headers,
      method: uppercaseMethod,
      mode,
      cache,
      redirect,
      referrer,
      referrerPolicy,
      integrity,
      keepalive,
      signal,
    };

    const responseReceivedInfo = {
      url,
      init,
      requestKey,
      responseType,
    };

    // This is necessary because `options` may have overridden the props.
    // If the request config changes, we need to be able to accurately
    // cancel the in-flight request.
    this.responseReceivedInfo = responseReceivedInfo;

    const fetchPolicy = this.getFetchPolicy();

    let cachedResponse;
    if (fetchPolicy !== 'network-only' && !ignoreCache) {
      cachedResponse = responseCache[requestKey];

      if (cachedResponse) {
        this.onResponseReceived({
          ...responseReceivedInfo,
          response: cachedResponse,
          hittingNetwork: false,
          stillFetching: fetchPolicy === 'cache-and-network',
        });

        if (fetchPolicy === 'cache-first' || fetchPolicy === 'cache-only') {
          return Promise.resolve(cachedResponse);
        }
      } else if (fetchPolicy === 'cache-only') {
        const cacheError = new Error(
          `Response for "${requestName}" not found in cache.`
        );
        this.onResponseReceived({
          ...responseReceivedInfo,
          error: cacheError,
          hittingNetwork: false,
        });
        return Promise.resolve(cacheError);
      }
    }

    this.setState({
      requestKey,
      url,
      error: null,
      failed: false,
      fetching: true,
    });
    const hittingNetwork = !isRequestInFlight(requestKey) || !dedupe;

    if (hittingNetwork) {
      beforeFetch({
        url,
        init,
        requestKey,
      });
    }
    return fetchDedupe(url, init, { requestKey, responseType, dedupe }).then(
      res => {
        if (shouldCacheResponse) {
          responseCache[requestKey] = res;
        }

        if (this._currentRequestKey === requestKey) {
          this.onResponseReceived({
            ...responseReceivedInfo,
            response: res,
            hittingNetwork,
            resolve,
          });
        }

        return res;
      },
      error => {
        if (this._currentRequestKey === requestKey) {
          this.onResponseReceived({
            ...responseReceivedInfo,
            error,
            cachedResponse,
            hittingNetwork,
            resolve,
          });
        }

        return error;
      }
    );
  };

  onResponseReceived = info => {
    const {
      error = null,
      response = null,
      hittingNetwork,
      url,
      init,
      requestKey,
      cachedResponse,
      stillFetching = false,
      resolve,
    } = info;

    this.responseReceivedInfo = null;

    if (!stillFetching) {
      this._currentRequestKey = null;
    }

    let data;
    // If our response succeeded, then we use that data.
    if (response && response.data) {
      data = response.data;
    } else if (cachedResponse && cachedResponse.data) {
      // This happens when the request failed, but we have cache-and-network
      // specified. Although we pass along the failed response, we continue to
      // pass in the cached data.
      data = cachedResponse.data;
    }

    data = data ? this.props.transformData(data) : null;

    // If we already have some data in state on error, then we continue to
    // pass that data down. This prevents the data from being wiped when a
    // request fails, which is generally not what people want.
    // For more, see: GitHub Issue #154
    if (error && this.state.data) {
      data = this.state.data;
    }

    const afterFetchInfo = {
      url,
      init,
      requestKey,
      error,
      failed: Boolean(error || (response && !response.ok)),
      response,
      data,
      didUnmount: Boolean(this.willUnmount),
    };

    if (typeof resolve === 'function') {
      resolve(afterFetchInfo);
    }

    if (hittingNetwork) {
      this.props.afterFetch(afterFetchInfo);
    }

    if (this.willUnmount) {
      return;
    }

    this.setState(
      {
        url,
        data,
        error,
        response,
        fetching: stillFetching,
        requestKey,
      },
      () => this.props.onResponse(error, response)
    );
  };
}

const globalObj = typeof self !== 'undefined' ? self : this;
const AbortSignalCtr =
  globalObj !== undefined ? globalObj.AbortSignal : function() {};

Fetch.propTypes = {
  children: PropTypes.func,
  requestName: PropTypes.string,
  fetchPolicy: PropTypes.oneOf([
    'cache-first',
    'cache-and-network',
    'network-only',
    'cache-only',
  ]),
  onResponse: PropTypes.func,
  beforeFetch: PropTypes.func,
  afterFetch: PropTypes.func,
  responseType: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.oneOf(['json', 'text', 'blob', 'arrayBuffer', 'formData']),
  ]),
  transformData: PropTypes.func,
  lazy: PropTypes.bool,
  dedupe: PropTypes.bool,
  requestKey: PropTypes.string,

  url: PropTypes.string.isRequired,
  body: PropTypes.any,
  credentials: PropTypes.oneOf(['omit', 'same-origin', 'include']),
  headers: PropTypes.object,
  method: PropTypes.oneOf([
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'options',
    'head',
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
    'HEAD',
  ]),
  mode: PropTypes.oneOf([
    'same-origin',
    'cors',
    'no-cors',
    'navigate',
    'websocket',
  ]),
  cache: PropTypes.oneOf([
    'default',
    'no-store',
    'reload',
    'no-cache',
    'force-cache',
    'only-if-cached',
  ]),
  redirect: PropTypes.oneOf(['manual', 'follow', 'error']),
  referrer: PropTypes.string,
  referrerPolicy: PropTypes.oneOf([
    'no-referrer',
    'no-referrer-when-downgrade',
    'origin',
    'origin-when-cross-origin',
    'unsafe-url',
    '',
  ]),
  integrity: PropTypes.string,
  keepalive: PropTypes.bool,
  signal: PropTypes.instanceOf(AbortSignalCtr),
};

Fetch.defaultProps = {
  requestName: 'anonymousRequest',
  onResponse: () => {},
  beforeFetch: () => {},
  afterFetch: () => {},
  transformData: data => data,
  dedupe: true,

  method: 'get',
  referrerPolicy: '',
  integrity: '',
  referrer: 'about:client',
};
