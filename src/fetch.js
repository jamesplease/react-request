import React from 'react';
import PropTypes from 'prop-types';
import { getRequestKey, fetchDedupe, isRequestInFlight } from './fetch-dedupe';

// This object is our cache
// The keys of the object are requestKeys
// The value of each key is a Response instance
const responseCache = {};

export default class Fetch extends React.Component {
  render() {
    const { render, requestName, url } = this.props;
    const { fetching, response, data, error } = this.state;

    if (!render) {
      return null;
    } else {
      return (
        render({
          requestName,
          url,
          fetching,
          response,
          data,
          error,
          doFetch: opts => this.fetchData(opts, true)
        }) || null
      );
    }
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      requestName: props.requestName,
      fetching: !this.isLazy(),
      response: null,
      data: null,
      error: null
    };
  }

  isLazy = props => {
    const { lazy, method } = props || this.props;

    const uppercaseMethod = method.toUpperCase();

    let laziness;

    // We default to being lazy for "write" requests,
    // such as POST, PATCH, DELETE, and so on.
    if (typeof lazy === 'undefined') {
      laziness =
        uppercaseMethod !== 'GET' &&
        uppercaseMethod !== 'HEAD' &&
        uppercaseMethod !== 'OPTIONS';
    } else {
      laziness = lazy;
    }

    return laziness;
  };

  componentDidMount() {
    if (!this.isLazy()) {
      this.fetchData();
    }
  }

  componentWillReceiveProps(nextProps) {
    const currentRequestKey = getRequestKey(this.props);
    const nextRequestKey = getRequestKey(nextProps);

    if (currentRequestKey !== nextRequestKey) {
      this.fetchData(nextProps);
    }
  }

  componentWillUnmount() {
    this.willUnmount = true;
    this.cancelExistingRequest('Component unmounted');
  }

  // When a request is already in flight, and a new one is
  // configured, then we need to "cancel" the previous one.
  cancelExistingRequest = reason => {
    if (this.state.fetching && !this.hasHandledResponse) {
      this.onResponseReceived({
        ...this.responseReceivedInfo,
        error: new Error(reason),
        hittingNetwork: true
      });
    }
  };

  fetchData = (options, ignoreCache) => {
    const {
      fetchPolicy,
      requestName,
      dedupe,
      beforeFetch,
      afterFetch
    } = this.props;

    this.cancelExistingRequest('New fetch specified');

    const {
      url,
      request,
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
      signal
    } = Object.assign({}, this.props, options);

    const requestKey = getRequestKey({ url, method, body, responseType });

    const uppercaseMethod = method.toUpperCase();
    const isReadRequest = uppercaseMethod === 'GET';

    const responseReceivedInfo = {
      url,
      init,
      requestKey,
      responseType
    };

    // This is necessary because `options` may have overridden the props.
    // If the request config changes, we need to be able to accurately
    // cancel the in-flight request.
    this.responseReceivedInfo = responseReceivedInfo;
    this.hasHandledResponse = false;

    if (fetchPolicy !== 'network-only' && isReadRequest && !ignoreCache) {
      const cachedResponse = responseCache[requestKey];

      if (cachedResponse) {
        this.onResponseReceived({
          ...responseReceivedInfo,
          response: cachedResponse,
          hittingNetwork: false
        });

        if (fetchPolicy === 'cache-first') {
          return Promise.resolve(cachedResponse);
        }
      } else if (fetchPolicy === 'cache-only') {
        const cacheError = new Error(
          `Response for "${requestName}" not found in cache.`
        );
        this.onResponseReceived({
          ...responseReceivedInfo,
          error: cacheError,
          hittingNetwork: false
        });
        return Promise.resolve(cacheError);
      }
    }

    const init = {
      body,
      credentials,
      headers,
      method,
      mode,
      cache,
      redirect,
      referrer,
      referrerPolicy,
      integrity,
      keepalive,
      signal
    };

    this.setState({ fetching: true });

    const hittingNetwork = !isRequestInFlight(requestKey) || !dedupe;

    if (hittingNetwork) {
      beforeFetch({
        url,
        init,
        fetchDedupeConfig: { requestKey, responseType }
      });
    }

    return fetchDedupe(url, init, { requestKey, responseType, dedupe }).then(
      res => {
        if (isReadRequest) {
          responseCache[requestKey] = res;
        }

        if (!this.hasHandledResponse) {
          this.onResponseReceived({
            ...responseReceivedInfo,
            response: res,
            hittingNetwork
          });
        }

        return res;
      },
      error => {
        if (!this.hasHandledResponse) {
          this.onResponseReceived({
            ...responseReceivedInfo,
            error,
            hittingNetwork
          });
        }

        return error;
      }
    );
  };

  onResponseReceived = info => {
    const {
      error,
      response,
      hittingNetwork,
      url,
      init,
      requestKey,
      responseType
    } = info;

    this.responseReceivedInfo = null;
    this.hasHandledResponse = true;

    const data =
      response && response.data
        ? this.props.transformResponse(response.data)
        : null;

    if (hittingNetwork) {
      this.props.afterFetch({
        url,
        init,
        fetchDedupeConfig: { requestKey, responseType },
        error,
        response,
        data,
        didUnmount: this.willUnmount
      });
    }

    if (this.willUnmount) {
      return;
    }

    this.setState(
      {
        data,
        error,
        response,
        fetching: false
      },
      () => this.props.onResponse(error, response)
    );
  };
}

const globalObj = typeof self !== 'undefined' ? self : this;
const AbortSignalCtr = globalObj.AbortSignal || function() {};

Fetch.propTypes = {
  requestName: PropTypes.string,
  fetchPolicy: PropTypes.oneOf([
    'cache-first',
    'cache-and-network',
    'network-only',
    'cache-only'
  ]),
  onResponse: PropTypes.func,
  beforeFetch: PropTypes.func,
  afterFetch: PropTypes.func,
  responseType: PropTypes.oneOf([
    'json',
    'text',
    'blob',
    'arrayBuffer',
    'formData'
  ]),
  transformResponse: PropTypes.func,
  lazy: PropTypes.bool,
  dedupe: PropTypes.bool,

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
    'HEAD'
  ]),
  mode: PropTypes.oneOf([
    'same-origin',
    'cors',
    'no-cors',
    'navigate',
    'websocket'
  ]),
  cache: PropTypes.oneOf([
    'default',
    'no-store',
    'reload',
    'no-cache',
    'force-cache',
    'only-if-cached'
  ]),
  redirect: PropTypes.oneOf(['manual', 'follow', 'error']),
  referrer: PropTypes.string,
  referrerPolicy: PropTypes.oneOf([
    'no-referrer',
    'no-referrer-when-downgrade',
    'origin',
    'origin-when-cross-origin',
    'unsafe-url',
    ''
  ]),
  integrity: PropTypes.string,
  keepalive: PropTypes.bool,
  signal: PropTypes.instanceOf(AbortSignalCtr)
};

Fetch.defaultProps = {
  responseType: 'json',
  onResponse: () => {},
  beforeFetch: () => {},
  afterFetch: () => {},
  transformResponse: data => data,
  fetchPolicy: 'cache-first',
  dedupe: true,

  method: 'get',
  referrerPolicy: '',
  integrity: '',
  referrer: 'about:client'
};
