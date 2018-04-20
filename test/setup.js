import 'isomorphic-fetch';
import fetchMock from 'fetch-mock';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {
  successfulResponse, jsonResponse, jsonResponse2, jsonResponse3
} from './responses';

Enzyme.configure({ adapter: new Adapter() });

// We need an AbortSignal that can be instantiated without
// an error.
global.AbortSignal = function() {};

var hangingPromise = global.hangingPromise = function() {
  return new Promise(() => {});
}

fetchMock.get('/test/hangs', hangingPromise());
fetchMock.get('/test/hangs/1', hangingPromise());
fetchMock.get('/test/hangs/2', hangingPromise());
fetchMock.post('/test/hangs', hangingPromise());
fetchMock.put('/test/hangs', hangingPromise());
fetchMock.patch('/test/hangs', hangingPromise());
fetchMock.head('/test/hangs', hangingPromise());
fetchMock.delete('/test/hangs', hangingPromise());

// This could be improved by adding the URL to the JSON response
fetchMock.get('/test/succeeds', () => {
  return new Promise(resolve => {
    resolve(jsonResponse());
  });
});

fetchMock.get(
  '/test/succeeds/cache-only-empty',
  () =>
    new Promise(resolve => {
      resolve(successfulResponse());
    })
);

fetchMock.get(
  '/test/succeeds/cache-only-full',
  () =>
    new Promise(resolve => {
      resolve(jsonResponse());
    })
);

fetchMock.post(
  '/test/succeeds/cache-only-full',
  () =>
    new Promise(resolve => {
      resolve(jsonResponse());
    })
);

fetchMock.get(
  '/test/succeeds/json-one',
  () =>
    new Promise(resolve => {
      resolve(jsonResponse());
    })
);

fetchMock.get(
  '/test/succeeds/json-two',
  () =>
    new Promise(resolve => {
      resolve(jsonResponse2());
    })
);

fetchMock.patch(
  '/test/succeeds/patch',
  () =>
    new Promise(resolve => {
      resolve(jsonResponse3());
    })
);

// We do this at the start of each test, just in case a test
// replaces the global fetch and does not reset it
beforeEach(() => {
  fetchMock.reset();
});
