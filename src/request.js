import React from 'react';
import PropTypes from 'prop-types';
import fetchDedupe from './fetch-dedupe';

// This object is our cache
// The keys of the object are requestKeys
// The value of each key is a Response instance
const responseCache = {};

function getRequestKey({ url, method, type, body }) {
  return [url, method, type, body].join('||');
}

export default class Request extends React.Component {
  render() {
    const { render, requestName } = this.props;
    const { fetching, response, data, error } = this.state;

    if (!render) {
      return null;
    } else {
      return (
        render({
          requestName,
          fetching: fetching,
          response: response,
          data: data,
          error: error,
          fetch: this.fetchData
        }) || null
      );
    }
  }

  state = {
    requestName: this.props.requestName,
    fetching: !this.props.lazy,
    response: null,
    data: null,
    error: null
  };

  componentDidMount() {
    if (!this.props.lazy) {
      this.fetchData();
    }
  }

  componentWillReceiveProps(nextProps) {
    // only refresh when keys with primitive types change
    const refreshProps = ['url', 'method', 'type', 'body'];
    if (refreshProps.some(key => this.props[key] !== nextProps[key])) {
      this.fetchData(nextProps);
    }
  }

  componentWillUnmount() {
    this.willUnmount = true;
  }

  fetchData = (options, ignoreCache) => {
    const { fetchPolicy, requestName } = this.props;

    const {
      url,
      request,
      body,
      credentials,
      headers,
      method,
      type,
      mode,
      cache,
      redirect,
      referrer,
      referrerPolicy,
      integrity,
      keepalive,
      signal
    } = Object.assign({}, this.props, options);

    const requestKey = getRequestKey({ url, method, body, type });

    const onResponseReceived = ({ error, response }) => {
      if (this.willUnmount) {
        return;
      }

      const data =
        response && response.data
          ? this.props.transformResponse(response.data)
          : null;

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

    if (fetchPolicy !== 'network-only' || ignoreCache) {
      const cachedResponse = responseCache[requestKey];

      if (cachedResponse) {
        onResponseReceived({ response: cachedResponse });

        if (fetchPolicy === 'cache-first') {
          return Promise.resolve(cachedResponse);
        }
      } else if (fetchPolicy === 'cache-only') {
        const cacheError = new Error(
          `Response for "${requestName}" not found in cache.`
        );
        onResponseReceived({ error: cacheError });
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

    return fetchDedupe(url, init, { requestKey, type }).then(
      res => {
        responseCache[requestKey] = res;

        if (this.willUnmount) {
          return;
        }

        onResponseReceived({ response: res });
        return res;
      },
      error => {
        onResponseReceived({ error });
        return error;
      }
    );
  };
}

const globalObj = typeof self !== 'undefined' ? self : this;
const AbortSignalCtr = globalObj.AbortSignal || function() {};

Request.propTypes = {
  requestName: PropTypes.string,
  children: PropTypes.func,
  fetchPolicy: PropTypes.oneOf([
    'cache-first',
    'cache-and-network',
    'network-only',
    'cache-only'
  ]),
  onResponse: PropTypes.func,
  type: PropTypes.oneOf(['json', 'text', 'blob', 'arrayBuffer', 'formData']),
  transformResponse: PropTypes.func,
  lazy: PropTypes.bool,

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

Request.defaultProps = {
  type: 'json',
  onResponse: () => {},
  transformResponse: data => data,
  fetchPolicy: 'cache-first',
  lazy: false,

  method: 'get',
  referrerPolicy: '',
  integrity: '',
  referrer: 'about:client'
};