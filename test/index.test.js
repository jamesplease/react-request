import React from 'react';
import { shallow, mount } from 'enzyme';
import {
  Fetch,
  clearRequestCache,
  getRequestKey,
  clearResponseCache
} from '../src';
import { hangs, succeeds, fails } from './mock-fetch';

// Sometimes, the mock fetch returns a real Promise. Although it resolves synchronously,
// the callback is still a microtask.
// Accordingly, we schedule our assertions in a new task using `setTimeout`.
// It may seem hacky, but it's not arbitrary!
// For more, check out this blog post:
//
// https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
const networkTimeout = 0;

beforeEach(() => {
  clearRequestCache();
  clearResponseCache();
});

function setupHangingResponse() {
  global.fetch = jest.fn().mockReturnValue(hangs());
}

function setupSuccessfulResponse() {
  global.fetch = jest.fn().mockReturnValue(succeeds());
}

function setupNetworkError() {
  global.fetch = jest.fn().mockReturnValue(fails());
}

describe('rendering', () => {
  test('renders null with no render prop', () => {
    const wrapper = shallow(<Fetch url="/test" />);
    expect(wrapper.type()).toBe(null);
  });

  test('renders what you return from the render prop', () => {
    const wrapper = shallow(
      <Fetch url="/test" render={() => <a />} lazy={true} />
    );
    expect(wrapper.type()).toBe('a');
  });

  test('passes the right object shape to the render function', () => {
    const mockRender = jest.fn().mockReturnValue(null);
    const wrapper = shallow(
      <Fetch url="/test" requestName="tester" render={mockRender} lazy={true} />
    );
    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(mockRender).toBeCalledWith(
      expect.objectContaining({
        requestName: 'tester',
        url: '/test',
        fetching: false,
        response: null,
        data: null,
        error: null,
        doFetch: expect.any(Function)
      })
    );
  });
});

describe('init props', () => {
  it('should call fetch with the correct init', () => {
    const signal = new AbortSignal();
    mount(
      <Fetch
        url="/test"
        method="options"
        body="cheese"
        headers={{
          csrf: 'wat'
        }}
        credentials="include"
        mode="websocket"
        cache="reload"
        redirect="error"
        referrer="spaghetti"
        referrerPolicy="unsafe-url"
        integrity="sha-over-9000"
        keepalive={false}
        signal={signal}
      />
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toBeCalledWith('/test', {
      method: 'OPTIONS',
      body: 'cheese',
      headers: {
        csrf: 'wat'
      },
      credentials: 'include',
      mode: 'websocket',
      cache: 'reload',
      redirect: 'error',
      referrer: 'spaghetti',
      referrerPolicy: 'unsafe-url',
      integrity: 'sha-over-9000',
      keepalive: false,
      signal: signal
    });
  });
});

describe('successful requests', () => {
  beforeEach(() => {
    setupSuccessfulResponse();
  });

  test('it calls beforeFetch/afterFetch with the right arguments', done => {
    expect.assertions(4);
    const beforeFetchMock = jest.fn();
    const afterFetchMock = jest.fn();

    const requestKey = getRequestKey({
      url: '/test',
      method: 'GET',
      responseType: 'json'
    });

    const wrapper = mount(
      <Fetch
        url="/test"
        beforeFetch={beforeFetchMock}
        afterFetch={afterFetchMock}
      />
    );

    Promise.resolve()
      .then(() => {
        expect(beforeFetchMock).toHaveBeenCalledTimes(1);
        expect(beforeFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test',
            responseType: 'json',
            requestKey
          })
        );
        expect(afterFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test',
            error: null,
            didUnmount: false,
            responseType: 'json',
            data: {
              books: [1, 42, 150]
            }
          })
        );
        done();
      })
      .catch(done.fail);
  });

  test('it accepts a custom `responseType`, and calls afterFetch with the right arguments', done => {
    expect.assertions(2);
    const afterFetchMock = jest.fn();

    const wrapper = mount(
      <Fetch url="/test" afterFetch={afterFetchMock} responseType="text" />
    );

    Promise.resolve()
      .then(() => {
        expect(afterFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test',
            error: null,
            didUnmount: false,
            responseType: 'text',
            data: 'This is some text lol'
          })
        );
        done();
      })
      .catch(done.fail);
  });

  test('`transformData` is used to transform the response data', done => {
    expect.assertions(2);
    const afterFetchMock = jest.fn();
    function transformResponse(data) {
      return {
        sandwiches: data.books
      };
    }

    const wrapper = mount(
      <Fetch
        url="/test"
        afterFetch={afterFetchMock}
        transformResponse={transformResponse}
      />
    );

    Promise.resolve()
      .then(() => {
        expect(afterFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test',
            error: null,
            didUnmount: false,
            responseType: 'json',
            data: {
              sandwiches: [1, 42, 150]
            }
          })
        );
        done();
      })
      .catch(done.fail);
  });
});

describe('cache strategies', () => {
  beforeEach(() => {
    setupSuccessfulResponse();
  });

  describe('cache-only', () => {
    test('errors when there is nothing in the cache', done => {
      expect.assertions(4);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test"
          requestName="meepmeep"
          fetchPolicy="cache-only"
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      Promise.resolve()
        .then(() => {
          expect(beforeFetchMock).toHaveBeenCalledTimes(0);
          expect(afterFetchMock).toHaveBeenCalledTimes(0);
          expect(onResponseMock).toHaveBeenCalledTimes(1);

          expect(onResponseMock).toBeCalledWith(
            expect.objectContaining({
              message: 'Response for "meepmeep" not found in cache.'
            }),
            null
          );

          done();
        })
        .catch(done.fail);
    });

    test('it returns the cached data when found', done => {
      expect.assertions(11);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      // First, we need to add some stuff to the cache
      mount(
        <Fetch
          url="/test"
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      Promise.resolve()
        .then(() => {
          // NOTE: this is for adding stuff to the cache.
          // This DOES NOT test the cache-only behavior!
          expect(global.fetch).toHaveBeenCalledTimes(1);
          expect(beforeFetchMock).toHaveBeenCalledTimes(1);
          expect(afterFetchMock).toHaveBeenCalledTimes(1);
          expect(afterFetchMock).toBeCalledWith(
            expect.objectContaining({
              url: '/test',
              error: null,
              didUnmount: false,
              responseType: 'json',
              data: {
                books: [1, 42, 150]
              }
            })
          );
          expect(onResponseMock).toHaveBeenCalledTimes(1);
          expect(onResponseMock).toBeCalledWith(
            null,
            expect.objectContaining({
              headers: {},
              ok: true,
              redirect: false,
              status: 200,
              statusText: 'OK',
              type: 'basic',
              url: '/test',
              data: {
                books: [1, 42, 150]
              }
            })
          );

          const beforeFetchMock2 = jest.fn();
          const afterFetchMock2 = jest.fn();
          const onResponseMock2 = jest.fn();

          mount(
            <Fetch
              fetchPolicy="cache-only"
              url="/test"
              beforeFetch={beforeFetchMock2}
              afterFetch={afterFetchMock2}
              onResponse={onResponseMock2}
            />
          );

          Promise.resolve()
            .then(() => {
              expect(global.fetch).toHaveBeenCalledTimes(1);
              expect(beforeFetchMock2).toHaveBeenCalledTimes(0);
              expect(afterFetchMock2).toHaveBeenCalledTimes(0);
              expect(onResponseMock2).toHaveBeenCalledTimes(1);
              expect(onResponseMock2).toBeCalledWith(
                null,
                expect.objectContaining({
                  headers: {},
                  ok: true,
                  redirect: false,
                  status: 200,
                  statusText: 'OK',
                  type: 'basic',
                  url: '/test',
                  data: {
                    books: [1, 42, 150]
                  }
                })
              );
              done();
            })
            .catch(done.fail);
        })
        .catch(done.fail);
    });
  });

  describe('cache-first', () => {
    // By "identical" I mean that their request keys are the same
    test('it only makes one network request when two "identical" components are mounted', done => {
      expect.assertions(11);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test"
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      Promise.resolve()
        .then(() => {
          expect(beforeFetchMock).toHaveBeenCalledTimes(1);
          expect(beforeFetchMock).toBeCalledWith(
            expect.objectContaining({
              url: '/test',
              responseType: 'json'
            })
          );

          expect(afterFetchMock).toHaveBeenCalledTimes(1);
          expect(afterFetchMock).toBeCalledWith(
            expect.objectContaining({
              url: '/test',
              error: null,
              didUnmount: false,
              responseType: 'json',
              data: {
                books: [1, 42, 150]
              }
            })
          );
          expect(onResponseMock).toHaveBeenCalledTimes(1);
          expect(onResponseMock).toBeCalledWith(
            null,
            expect.objectContaining({
              headers: {},
              ok: true,
              redirect: false,
              status: 200,
              statusText: 'OK',
              type: 'basic',
              url: '/test',
              data: {
                books: [1, 42, 150]
              }
            })
          );

          const beforeFetchMock2 = jest.fn();
          const afterFetchMock2 = jest.fn();
          const onResponseMock2 = jest.fn();

          mount(
            <Fetch
              url="/test"
              beforeFetch={beforeFetchMock2}
              afterFetch={afterFetchMock2}
              onResponse={onResponseMock2}
            />
          );

          Promise.resolve()
            .then(() => {
              expect(global.fetch).toHaveBeenCalledTimes(1);
              expect(beforeFetchMock2).toHaveBeenCalledTimes(0);
              expect(afterFetchMock2).toHaveBeenCalledTimes(0);
              expect(onResponseMock2).toHaveBeenCalledTimes(1);
              expect(onResponseMock2).toBeCalledWith(
                null,
                expect.objectContaining({
                  headers: {},
                  ok: true,
                  redirect: false,
                  status: 200,
                  statusText: 'OK',
                  type: 'basic',
                  url: '/test',
                  data: {
                    books: [1, 42, 150]
                  }
                })
              );
              done();
            })
            .catch(done.fail);
        })
        .catch(done.fail);
    });
  });

  describe('network-only', () => {
    // By "identical" I mean that their request keys are the same
    test('it makes two network requests, even when two "identical" components are mounted', done => {
      expect.assertions(13);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test"
          fetchPolicy="network-only"
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      Promise.resolve()
        .then(() => {
          expect(beforeFetchMock).toHaveBeenCalledTimes(1);
          expect(beforeFetchMock).toBeCalledWith(
            expect.objectContaining({
              url: '/test',
              responseType: 'json'
            })
          );
          expect(afterFetchMock).toHaveBeenCalledTimes(1);
          expect(afterFetchMock).toBeCalledWith(
            expect.objectContaining({
              url: '/test',
              error: null,
              didUnmount: false,
              responseType: 'json',
              data: {
                books: [1, 42, 150]
              }
            })
          );
          expect(onResponseMock).toHaveBeenCalledTimes(1);
          expect(onResponseMock).toBeCalledWith(
            null,
            expect.objectContaining({
              headers: {},
              ok: true,
              redirect: false,
              status: 200,
              statusText: 'OK',
              type: 'basic',
              url: '/test',
              data: {
                books: [1, 42, 150]
              }
            })
          );

          const onResponseMock2 = jest.fn();
          const beforeFetchMock2 = jest.fn();
          const afterFetchMock2 = jest.fn();

          mount(
            <Fetch
              url="/test"
              fetchPolicy="network-only"
              beforeFetch={beforeFetchMock2}
              afterFetch={afterFetchMock2}
              onResponse={onResponseMock2}
            />
          );

          Promise.resolve()
            .then(() => {
              expect(global.fetch).toHaveBeenCalledTimes(2);
              expect(beforeFetchMock2).toHaveBeenCalledTimes(1);
              expect(beforeFetchMock2).toBeCalledWith(
                expect.objectContaining({
                  url: '/test',
                  responseType: 'json'
                })
              );
              expect(afterFetchMock2).toHaveBeenCalledTimes(1);
              expect(afterFetchMock2).toBeCalledWith(
                expect.objectContaining({
                  url: '/test',
                  error: null,
                  didUnmount: false,
                  responseType: 'json',
                  data: {
                    books: [1, 42, 150]
                  }
                })
              );
              expect(onResponseMock2).toHaveBeenCalledTimes(1);
              expect(onResponseMock2).toBeCalledWith(
                null,
                expect.objectContaining({
                  headers: {},
                  ok: true,
                  redirect: false,
                  status: 200,
                  statusText: 'OK',
                  type: 'basic',
                  url: '/test',
                  data: {
                    books: [1, 42, 150]
                  }
                })
              );
              done();
            })
            .catch(done.fail);
        })
        .catch(done.fail);
    });
  });

  describe('cache-and-network', () => {
    // By "identical" I mean that their request keys are the same
    test('it makes two network requests, even when two "identical" components are mounted', done => {
      expect.assertions(12);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test"
          fetchPolicy="cache-and-network"
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      Promise.resolve()
        .then(() => {
          expect(beforeFetchMock).toHaveBeenCalledTimes(1);
          expect(beforeFetchMock).toBeCalledWith(
            expect.objectContaining({
              url: '/test',
              responseType: 'json'
            })
          );
          expect(afterFetchMock).toHaveBeenCalledTimes(1);
          expect(afterFetchMock).toBeCalledWith(
            expect.objectContaining({
              url: '/test',
              error: null,
              didUnmount: false,
              responseType: 'json',
              data: {
                books: [1, 42, 150]
              }
            })
          );
          expect(onResponseMock).toHaveBeenCalledTimes(1);
          expect(onResponseMock).toBeCalledWith(
            null,
            expect.objectContaining({
              headers: {},
              ok: true,
              redirect: false,
              status: 200,
              statusText: 'OK',
              type: 'basic',
              url: '/test',
              data: {
                books: [1, 42, 150]
              }
            })
          );

          const onResponseMock2 = jest.fn();
          const beforeFetchMock2 = jest.fn();
          const afterFetchMock2 = jest.fn();

          mount(
            <Fetch
              url="/test"
              fetchPolicy="cache-and-network"
              beforeFetch={beforeFetchMock2}
              afterFetch={afterFetchMock2}
              onResponse={onResponseMock2}
            />
          );

          Promise.resolve()
            .then(() => {
              expect(global.fetch).toHaveBeenCalledTimes(2);
              expect(beforeFetchMock2).toHaveBeenCalledTimes(1);
              expect(beforeFetchMock2).toBeCalledWith(
                expect.objectContaining({
                  url: '/test',
                  responseType: 'json'
                })
              );
              expect(afterFetchMock2).toHaveBeenCalledTimes(1);
              expect(afterFetchMock).toBeCalledWith(
                expect.objectContaining({
                  url: '/test',
                  error: null,
                  didUnmount: false,
                  responseType: 'json',
                  data: {
                    books: [1, 42, 150]
                  }
                })
              );
              // Two calls: the first is for the cache, and the second is
              // for when the network returns success
              expect(onResponseMock2).toHaveBeenCalledTimes(2);
              done();
            })
            .catch(done.fail);
        })
        .catch(done.fail);
    });

    test('handles failure correctly', done => {
      expect.assertions(13);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test"
          fetchPolicy="cache-and-network"
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      Promise.resolve().then(() => {
        expect(beforeFetchMock).toHaveBeenCalledTimes(1);
        expect(beforeFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test',
            responseType: 'json'
          })
        );
        expect(afterFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test',
            error: null,
            didUnmount: false,
            responseType: 'json',
            data: {
              books: [1, 42, 150]
            }
          })
        );
        expect(onResponseMock).toHaveBeenCalledTimes(1);
        expect(onResponseMock).toBeCalledWith(
          null,
          expect.objectContaining({
            headers: {},
            ok: true,
            redirect: false,
            status: 200,
            statusText: 'OK',
            type: 'basic',
            url: '/test',
            data: {
              books: [1, 42, 150]
            }
          })
        );

        setupNetworkError();

        const onResponseMock2 = jest.fn();
        const beforeFetchMock2 = jest.fn();
        const afterFetchMock2 = jest.fn();

        mount(
          <Fetch
            url="/test"
            fetchPolicy="cache-and-network"
            beforeFetch={beforeFetchMock2}
            afterFetch={afterFetchMock2}
            onResponse={onResponseMock2}
          />
        );

        setTimeout(() => {
          // This is 1 rather than 2 since we swapped the fetch above.
          // This could be refactored so that the fetch never gets swapped
          expect(global.fetch).toHaveBeenCalledTimes(1);
          expect(beforeFetchMock2).toHaveBeenCalledTimes(1);
          expect(beforeFetchMock2).toBeCalledWith(
            expect.objectContaining({
              url: '/test',
              responseType: 'json'
            })
          );
          expect(afterFetchMock2).toHaveBeenCalledTimes(1);
          expect(afterFetchMock2).toBeCalledWith(
            expect.objectContaining({
              url: '/test',
              didUnmount: false,
              responseType: 'json',
              data: {
                books: [1, 42, 150]
              }
            })
          );
          expect(afterFetchMock2.mock.calls[0][0]).toHaveProperty(
            'error.message',
            'Network error'
          );
          // Two calls: the first is for the cache, and the second is
          // for when the network returns success
          expect(onResponseMock2).toHaveBeenCalledTimes(2);
          done();
        }, networkTimeout);
      });
    });
  });
});

describe('unsuccessful requests', () => {
  beforeEach(() => {
    setupNetworkError();
  });

  test('it calls afterFetch with the right arguments', done => {
    expect.assertions(3);
    const afterFetchMock = jest.fn();

    const wrapper = mount(<Fetch url="/test" afterFetch={afterFetchMock} />);

    setTimeout(() => {
      expect(afterFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toBeCalledWith(
        expect.objectContaining({
          url: '/test',
          didUnmount: false,
          responseType: 'json'
        })
      );
      expect(afterFetchMock.mock.calls[0][0]).toHaveProperty(
        'error.message',
        'Network error'
      );
      done();
    }, networkTimeout);
  });
});

describe('request deduplication', () => {
  test('it should dispatch two requests with the same key before they resolve', () => {
    const beforeFetchMock1 = jest.fn();
    const beforeFetchMock2 = jest.fn();

    shallow(<Fetch url="/test" beforeFetch={beforeFetchMock1} />);
    shallow(<Fetch url="/test" beforeFetch={beforeFetchMock2} />);

    expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
    expect(beforeFetchMock2).toHaveBeenCalledTimes(0);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('it should dispatch two requests with the same key before they resolve when dedupe:false is passed to both', () => {
    const beforeFetchMock1 = jest.fn();
    const beforeFetchMock2 = jest.fn();

    shallow(
      <Fetch url="/test" beforeFetch={beforeFetchMock1} dedupe={false} />
    );
    shallow(
      <Fetch url="/test" beforeFetch={beforeFetchMock2} dedupe={false} />
    );

    expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
    expect(beforeFetchMock2).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('it should dispatch two requests with the same key before they resolve when dedupe:false is passed to just one of them', () => {
    const beforeFetchMock1 = jest.fn();
    const beforeFetchMock2 = jest.fn();

    shallow(<Fetch url="/test" beforeFetch={beforeFetchMock1} />);
    shallow(
      <Fetch url="/test" beforeFetch={beforeFetchMock2} dedupe={false} />
    );

    expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
    expect(beforeFetchMock2).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('it should dispatch two requests with different keys', () => {
    const beforeFetchMock1 = jest.fn();
    const beforeFetchMock2 = jest.fn();

    shallow(<Fetch url="/test/1" beforeFetch={beforeFetchMock1} />);
    shallow(<Fetch url="/test/2" beforeFetch={beforeFetchMock2} />);

    expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
    expect(beforeFetchMock2).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('dedupe:false with successful data should return the proper data', done => {
    setupNetworkError();

    const beforeFetchMock = jest.fn();
    const afterFetchMock = jest.fn();
    const onResponseMock = jest.fn();
    shallow(
      <Fetch
        url="/test/1"
        beforeFetch={beforeFetchMock}
        afterFetch={afterFetchMock}
        onResponse={onResponseMock}
        dedupe={false}
      />
    );

    expect(beforeFetchMock).toHaveBeenCalledTimes(1);
    setTimeout(() => {
      expect(afterFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toBeCalledWith(
        expect.objectContaining({
          url: '/test/1',
          didUnmount: false,
          responseType: 'json'
        })
      );
      expect(afterFetchMock.mock.calls[0][0]).toHaveProperty(
        'error.message',
        'Network error'
      );
      done();
    }, networkTimeout);
  });
});

// Request cancellation can be tested by checking if `afterFetch` is called
// with a specific kind of error.
describe('request cancellation', () => {
  test('it should not cancel when a single request is initiated', () => {
    const afterFetchMock = jest.fn();

    const wrapper = shallow(<Fetch url="/test" afterFetch={afterFetchMock} />);

    expect(afterFetchMock).toHaveBeenCalledTimes(0);
  });

  test('it should cancel when a double request is initiated via `doFetch`', () => {
    expect.assertions(2);
    jest.useFakeTimers();
    const afterFetchMock = jest.fn();

    let hasFetched = false;
    const wrapper = shallow(
      <Fetch
        url="/test"
        afterFetch={afterFetchMock}
        render={({ doFetch }) => {
          if (!hasFetched) {
            hasFetched = true;
            doFetch();
          }
        }}
      />
    );

    jest.runOnlyPendingTimers();
    expect(afterFetchMock).toHaveBeenCalledTimes(1);
    expect(afterFetchMock.mock.calls[0][0]).toHaveProperty(
      'error.message',
      'New fetch initiated'
    );
  });

  test('it should cancel when a double request is initiated via prop changes', () => {
    const afterFetchMock = jest.fn();

    const wrapper = shallow(<Fetch url="/test" afterFetch={afterFetchMock} />);

    wrapper.setProps({
      url: '/test/2'
    });

    expect(afterFetchMock).toHaveBeenCalledTimes(1);
    expect(afterFetchMock.mock.calls[0][0]).toHaveProperty(
      'error.message',
      'New fetch initiated'
    );
  });

  test('it should cancel when the component unmounts', () => {
    const afterFetchMock = jest.fn();

    const wrapper = shallow(<Fetch url="/test" afterFetch={afterFetchMock} />);

    wrapper.unmount();

    expect(afterFetchMock).toHaveBeenCalledTimes(1);
    expect(afterFetchMock.mock.calls[0][0]).toHaveProperty(
      'error.message',
      'Component unmounted'
    );
    expect(afterFetchMock).toBeCalledWith(
      expect.objectContaining({
        url: '/test',
        didUnmount: true
      })
    );
  });
});

describe('laziness', () => {
  describe('defaults', () => {
    test('is false when just a URL is passed', () => {
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();
      const wrapper = mount(
        <Fetch
          url="/test"
          beforeFetch={beforeFetchMock}
          afterFetchMock={afterFetchMock}
        />
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(beforeFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toHaveBeenCalledTimes(0);
    });

    test('is false when method is GET, HEAD, or OPTIONS', () => {
      const beforeFetchMock1 = jest.fn();
      const beforeFetchMock2 = jest.fn();
      const beforeFetchMock3 = jest.fn();
      const afterFetchMock1 = jest.fn();
      const afterFetchMock2 = jest.fn();
      const afterFetchMock3 = jest.fn();

      mount(
        <Fetch
          url="/test"
          method="GET"
          beforeFetch={beforeFetchMock1}
          afterFetch={afterFetchMock1}
        />
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
      expect(afterFetchMock1).toHaveBeenCalledTimes(0);

      mount(
        <Fetch
          url="/test"
          method="HEAD"
          beforeFetch={beforeFetchMock2}
          afterFetch={afterFetchMock2}
        />
      );
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
      expect(afterFetchMock2).toHaveBeenCalledTimes(0);

      mount(
        <Fetch
          url="/test"
          method="OPTIONS"
          beforeFetch={beforeFetchMock3}
          afterFetch={afterFetchMock3}
        />
      );
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(beforeFetchMock3).toHaveBeenCalledTimes(1);
      expect(afterFetchMock3).toHaveBeenCalledTimes(0);
    });

    test('is true when method is POST, PATCH, PUT, or DELETE', () => {
      const beforeFetchMock1 = jest.fn();
      const beforeFetchMock2 = jest.fn();
      const beforeFetchMock3 = jest.fn();
      const beforeFetchMock4 = jest.fn();
      const afterFetchMock1 = jest.fn();
      const afterFetchMock2 = jest.fn();
      const afterFetchMock3 = jest.fn();
      const afterFetchMock4 = jest.fn();

      mount(
        <Fetch
          url="/test"
          method="POST"
          beforeFetch={beforeFetchMock1}
          afterFetch={afterFetchMock1}
        />
      );
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(beforeFetchMock1).toHaveBeenCalledTimes(0);
      expect(afterFetchMock1).toHaveBeenCalledTimes(0);

      mount(
        <Fetch
          url="/test"
          method="PATCH"
          beforeFetch={beforeFetchMock2}
          afterFetch={afterFetchMock2}
        />
      );
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(beforeFetchMock2).toHaveBeenCalledTimes(0);
      expect(afterFetchMock2).toHaveBeenCalledTimes(0);

      mount(
        <Fetch
          url="/test"
          method="PUT"
          beforeFetch={beforeFetchMock3}
          afterFetch={afterFetchMock3}
        />
      );
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(beforeFetchMock3).toHaveBeenCalledTimes(0);
      expect(afterFetchMock3).toHaveBeenCalledTimes(0);

      mount(
        <Fetch
          url="/test"
          method="DELETE"
          beforeFetch={beforeFetchMock4}
          afterFetch={afterFetchMock4}
        />
      );
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(beforeFetchMock4).toHaveBeenCalledTimes(0);
      expect(afterFetchMock4).toHaveBeenCalledTimes(0);
    });
  });

  describe('manually specifying it', () => {
    test('it should override the default for "read" methods', () => {
      const beforeFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test"
          method="GET"
          beforeFetch={beforeFetchMock}
          lazy={true}
        />
      );

      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(beforeFetchMock).toHaveBeenCalledTimes(0);
    });

    test('it should override the default for "write" methods', () => {
      const beforeFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test"
          method="DELETE"
          beforeFetch={beforeFetchMock}
          lazy={false}
        />
      );

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(beforeFetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
