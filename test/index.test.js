import React from 'react';
import fetchMock from 'fetch-mock';
import { shallow, mount } from 'enzyme';
import {
  Fetch,
  clearRequestCache,
  getRequestKey,
  clearResponseCache
} from '../src';
import { successfulResponse, jsonResponse } from './responses';

let success = true;
// This could be improved by adding the URL to the JSON response
fetchMock.get('/test/variable', () => {
  if (success) {
    return new Promise(resolve => {
      resolve(jsonResponse());
    });
  } else {
    return new Promise((resolve, reject) => {
      reject({
        message: 'Network error'
      });
    });
  }
});

// Some time for the mock fetches to resolve
const networkTimeout = 10;

beforeEach(() => {
  success = true;
  clearRequestCache();
  clearResponseCache();
});

describe('rendering', () => {
  test('renders null with no render prop', () => {
    const wrapper = shallow(<Fetch url="/test/hangs" />);
    expect(wrapper.type()).toBe(null);
    expect(fetchMock.calls('/test/hangs').length).toBe(1);
  });

  test('renders what you return from the render prop', () => {
    const wrapper = shallow(
      <Fetch url="/test/hangs" children={() => <a />} lazy={true} />
    );
    expect(wrapper.type()).toBe('a');
    expect(fetchMock.calls('/test/hangs').length).toBe(0);
  });

  test('passes the right object shape to the render function', () => {
    const mockRender = jest.fn().mockReturnValue(null);
    shallow(
      <Fetch
        url="/test/hangs"
        requestName="tester"
        children={mockRender}
        lazy={true}
      />
    );
    const requestKey = getRequestKey({
      url: '/test/hangs',
      method: 'GET'
    });
    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(mockRender).toBeCalledWith(
      expect.objectContaining({
        requestName: 'tester',
        requestKey,
        url: '/test/hangs',
        fetching: false,
        failed: false,
        response: null,
        data: null,
        error: null,
        doFetch: expect.any(Function)
      })
    );
    expect(fetchMock.calls('/test/hangs').length).toBe(0);
  });
});

describe('init props', () => {
  it('should call fetch with the correct init', () => {
    const signal = new AbortSignal();
    mount(
      <Fetch
        url="/test/hangs"
        method="head"
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

    expect(fetchMock.calls('/test/hangs').length).toBe(1);

    expect(fetchMock.lastCall('/test/hangs')).toEqual([
      '/test/hangs',
      {
        method: 'HEAD',
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
      }
    ]);
  });
});

describe('successful requests', () => {
  test('it calls beforeFetch/afterFetch with the right arguments', done => {
    fetchMock.get(
      '/test/succeeds/first',
      new Promise(resolve => {
        resolve(jsonResponse());
      })
    );

    expect.assertions(4);
    const beforeFetchMock = jest.fn();
    const afterFetchMock = jest.fn();

    const requestKey = getRequestKey({
      url: '/test/succeeds/first',
      method: 'GET'
    });

    mount(
      <Fetch
        url="/test/succeeds/first"
        beforeFetch={beforeFetchMock}
        afterFetch={afterFetchMock}
      />
    );

    setTimeout(() => {
      expect(beforeFetchMock).toHaveBeenCalledTimes(1);
      expect(beforeFetchMock).toBeCalledWith(
        expect.objectContaining({
          url: '/test/succeeds/first',
          requestKey
        })
      );
      expect(afterFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toBeCalledWith(
        expect.objectContaining({
          url: '/test/succeeds/first',
          error: null,
          failed: false,
          didUnmount: false,
          data: {
            books: [1, 42, 150]
          }
        })
      );
      done();
    }, networkTimeout);
  });

  test('`doFetch()` returns a promise that resolves with the same object as `afterFetch`', done => {
    fetchMock.get(
      '/test/succeeds/dofetch-promise',
      new Promise(resolve => {
        resolve(jsonResponse());
      })
    );

    expect.assertions(2);
    const afterFetchMock = jest.fn();
    const childrenMock = jest.fn();

    mount(
      <Fetch
        url="/test/succeeds/first"
        afterFetch={afterFetchMock}
        children={childrenMock}
        lazy
      />
    );

    const { doFetch } = childrenMock.mock.calls[0][0];
    doFetch().then(afterFetchInfo => {
      setTimeout(() => {
        expect(afterFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toBeCalledWith(afterFetchInfo);
        done();
      });
    });
  })

  test('`doFetch()` returned promise resolves even if there was an error', done => {
    fetchMock.get(
      "/test/fails/dofetch-promise",
      new Promise((resolve, reject) => {
        reject({
          message: "Network error"
        });
      })
    );

    expect.assertions(1);
    const childrenMock = jest.fn();

    mount(
      <Fetch
        url="/test/fails/dofetch-promise"
        children={childrenMock}
      />
    );

    const { doFetch } = childrenMock.mock.calls[0][0];
    doFetch().then(afterFetchInfo => {
      expect(afterFetchInfo).toMatchObject({
        url: "/test/fails/dofetch-promise",
        error: {
          message: "Network error"
        },
        failed: true,
        didUnmount: false,
        data: null
      });
      done();
    });
  })

  test('it accepts a custom `responseType`, and calls afterFetch with the right arguments', done => {
    fetchMock.get(
      '/test/succeeds/second',
      new Promise(resolve => {
        resolve(successfulResponse());
      })
    );

    expect.assertions(2);
    const afterFetchMock = jest.fn();

    mount(
      <Fetch
        url="/test/succeeds/second"
        afterFetch={afterFetchMock}
        responseType="text"
      />
    );

    setTimeout(() => {
      expect(afterFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toBeCalledWith(
        expect.objectContaining({
          url: '/test/succeeds/second',
          error: null,
          failed: false,
          didUnmount: false,
          data: 'hi'
        })
      );
      done();
    }, networkTimeout);
  });

  test('it sets data to `null` if the contentType does not parse the data', done => {
    fetchMock.get(
      '/test/succeeds/second-mismatch-content-type',
      new Promise(resolve => {
        resolve(successfulResponse());
      })
    );

    expect.assertions(2);
    const afterFetchMock = jest.fn();

    mount(
      <Fetch
        url="/test/succeeds/second-mismatch-content-type"
        afterFetch={afterFetchMock}
        responseType="json"
      />
    );

    setTimeout(() => {
      expect(afterFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toBeCalledWith(
        expect.objectContaining({
          url: '/test/succeeds/second-mismatch-content-type',
          error: null,
          failed: false,
          didUnmount: false,
          data: null
        })
      );
      done();
    }, networkTimeout);
  });

  test('it accepts a custom `responseType` as a function, and calls afterFetch with the right arguments', done => {
    fetchMock.get(
      '/test/succeeds/secondpls',
      new Promise(resolve => {
        resolve(successfulResponse());
      })
    );

    expect.assertions(2);
    const afterFetchMock = jest.fn();

    mount(
      <Fetch
        url="/test/succeeds/secondpls"
        afterFetch={afterFetchMock}
        responseType={() => 'text'}
      />
    );

    setTimeout(() => {
      expect(afterFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toBeCalledWith(
        expect.objectContaining({
          url: '/test/succeeds/secondpls',
          error: null,
          failed: false,
          didUnmount: false,
          data: 'hi'
        })
      );
      done();
    }, networkTimeout);
  });

  test('`transformData` is used to transform the response data', done => {
    fetchMock.get(
      '/test/succeeds/third',
      new Promise(resolve => {
        resolve(jsonResponse());
      })
    );

    expect.assertions(3);
    const afterFetchMock = jest.fn();
    const childrenMock = jest.fn();
    function transformData(data) {
      return {
        sandwiches: data.books
      };
    }

    mount(
      <Fetch
        url="/test/succeeds/third"
        afterFetch={afterFetchMock}
        transformData={transformData}
        lazy
        children={childrenMock}
      />
    );

    const expectedAfterFetch = {
      url: '/test/succeeds/third',
      error: null,
      failed: false,
      didUnmount: false,
      data: {
        sandwiches: [1, 42, 150]
      }
    };

    const { doFetch } = childrenMock.mock.calls[0][0];
    doFetch().then(afterFetchInfo => {
      expect(afterFetchInfo).toMatchObject(expectedAfterFetch);
    });

    setTimeout(() => {
      expect(afterFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toBeCalledWith(
        expect.objectContaining(expectedAfterFetch)
      );
      done();
    }, networkTimeout);
  });
});

describe('cache strategies', () => {
  describe('cache-only', () => {
    test('errors when there is nothing in the cache', done => {
      expect.assertions(5);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test/succeeds/cache-only-empty"
          requestName="meepmeep"
          fetchPolicy="cache-only"
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      Promise.resolve()
        .then(() => {
          expect(
            fetchMock.calls('/test/succeeds/cache-only-empty').length
          ).toBe(0);
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

    test('respects `cacheResponse: false`, erroring', done => {
      expect.assertions(11);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      // First, we need to add some stuff to the cache
      mount(
        <Fetch
          url="/test/succeeds/cache-only-full"
          cacheResponse={false}
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      setTimeout(() => {
        // NOTE: this is for adding stuff to the cache.
        // This DOES NOT test the cache-only behavior!
        expect(fetchMock.calls('/test/succeeds/cache-only-full').length).toBe(
          1
        );
        expect(beforeFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test/succeeds/cache-only-full',
            error: null,
            didUnmount: false,
            data: {
              books: [1, 42, 150]
            }
          })
        );
        expect(onResponseMock).toHaveBeenCalledTimes(1);
        expect(onResponseMock).toBeCalledWith(
          null,
          expect.objectContaining({
            ok: true,
            status: 200,
            statusText: 'OK',
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
            requestName="meepmeep"
            url="/test/succeeds/cache-only-full"
            beforeFetch={beforeFetchMock2}
            afterFetch={afterFetchMock2}
            onResponse={onResponseMock2}
          />
        );

        setTimeout(() => {
          expect(fetchMock.calls('/test/succeeds/cache-only-full').length).toBe(
            1
          );
          expect(beforeFetchMock2).toHaveBeenCalledTimes(0);
          expect(afterFetchMock2).toHaveBeenCalledTimes(0);
          expect(onResponseMock2).toHaveBeenCalledTimes(1);
          expect(onResponseMock2).toBeCalledWith(
            expect.objectContaining({
              message: 'Response for "meepmeep" not found in cache.'
            }),
            null
          );
          done();
        }, networkTimeout);
      }, networkTimeout);
    });

    test('it returns the cached data when found', done => {
      expect.assertions(11);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      // First, we need to add some stuff to the cache
      mount(
        <Fetch
          url="/test/succeeds/cache-only-full"
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      setTimeout(() => {
        // NOTE: this is for adding stuff to the cache.
        // This DOES NOT test the cache-only behavior!
        expect(fetchMock.calls('/test/succeeds/cache-only-full').length).toBe(
          1
        );
        expect(beforeFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test/succeeds/cache-only-full',
            error: null,
            failed: false,
            didUnmount: false,
            data: {
              books: [1, 42, 150]
            }
          })
        );
        expect(onResponseMock).toHaveBeenCalledTimes(1);
        expect(onResponseMock).toBeCalledWith(
          null,
          expect.objectContaining({
            ok: true,
            status: 200,
            statusText: 'OK',
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
            url="/test/succeeds/cache-only-full"
            beforeFetch={beforeFetchMock2}
            afterFetch={afterFetchMock2}
            onResponse={onResponseMock2}
          />
        );

        setTimeout(() => {
          expect(fetchMock.calls('/test/succeeds/cache-only-full').length).toBe(
            1
          );
          expect(beforeFetchMock2).toHaveBeenCalledTimes(0);
          expect(afterFetchMock2).toHaveBeenCalledTimes(0);
          expect(onResponseMock2).toHaveBeenCalledTimes(1);
          expect(onResponseMock2).toBeCalledWith(
            null,
            expect.objectContaining({
              ok: true,
              status: 200,
              statusText: 'OK',
              data: {
                books: [1, 42, 150]
              }
            })
          );
          done();
        }, networkTimeout);
      }, networkTimeout);
    });

    test('it returns the cached data when found; POST method', done => {
      expect.assertions(11);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      // First, we need to add some stuff to the cache
      mount(
        <Fetch
          url="/test/succeeds/cache-only-full"
          lazy={false}
          method="POST"
          cacheResponse
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      setTimeout(() => {
        // NOTE: this is for adding stuff to the cache.
        // This DOES NOT test the cache-only behavior!
        expect(fetchMock.calls('/test/succeeds/cache-only-full').length).toBe(
          1
        );
        expect(beforeFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test/succeeds/cache-only-full',
            error: null,
            failed: false,
            didUnmount: false,
            data: {
              books: [1, 42, 150]
            }
          })
        );
        expect(onResponseMock).toHaveBeenCalledTimes(1);
        expect(onResponseMock).toBeCalledWith(
          null,
          expect.objectContaining({
            ok: true,
            status: 200,
            statusText: 'OK',
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
            method="POST"
            lazy={false}
            cacheResponse
            url="/test/succeeds/cache-only-full"
            beforeFetch={beforeFetchMock2}
            afterFetch={afterFetchMock2}
            onResponse={onResponseMock2}
          />
        );

        setTimeout(() => {
          expect(fetchMock.calls('/test/succeeds/cache-only-full').length).toBe(
            1
          );
          expect(beforeFetchMock2).toHaveBeenCalledTimes(0);
          expect(afterFetchMock2).toHaveBeenCalledTimes(0);
          expect(onResponseMock2).toHaveBeenCalledTimes(1);
          expect(onResponseMock2).toBeCalledWith(
            null,
            expect.objectContaining({
              ok: true,
              status: 200,
              statusText: 'OK',
              data: {
                books: [1, 42, 150]
              }
            })
          );
          done();
        }, networkTimeout);
      }, networkTimeout);
    });
  });

  describe('cache-first', () => {
    // By "identical" I mean that their request keys are the same
    test('it only makes one network request when two "identical" components are mounted', done => {
      fetchMock.get(
        '/test/succeeds/cache-first',
        new Promise(resolve => {
          resolve(jsonResponse());
        })
      );

      expect.assertions(11);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test/succeeds/cache-first"
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      setTimeout(() => {
        expect(beforeFetchMock).toHaveBeenCalledTimes(1);
        expect(beforeFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test/succeeds/cache-first'
          })
        );

        expect(afterFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test/succeeds/cache-first',
            error: null,
            failed: false,
            didUnmount: false,
            data: {
              books: [1, 42, 150]
            }
          })
        );
        expect(onResponseMock).toHaveBeenCalledTimes(1);
        expect(onResponseMock).toBeCalledWith(
          null,
          expect.objectContaining({
            ok: true,
            status: 200,
            statusText: 'OK',
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
            url="/test/succeeds/cache-first"
            beforeFetch={beforeFetchMock2}
            afterFetch={afterFetchMock2}
            onResponse={onResponseMock2}
          />
        );

        setTimeout(() => {
          expect(fetchMock.calls('/test/succeeds/cache-first').length).toBe(1);
          expect(beforeFetchMock2).toHaveBeenCalledTimes(0);
          expect(afterFetchMock2).toHaveBeenCalledTimes(0);
          expect(onResponseMock2).toHaveBeenCalledTimes(1);
          expect(onResponseMock2).toBeCalledWith(
            null,
            expect.objectContaining({
              ok: true,
              status: 200,
              statusText: 'OK',
              data: {
                books: [1, 42, 150]
              }
            })
          );
          done();
        }, 10);
      }, networkTimeout);
    });
  });

  describe('network-only', () => {
    // By "identical" I mean that their request keys are the same
    test('it makes two network requests, even when two "identical" components are mounted', done => {
      fetchMock.get('/test/succeeds/network-only', () => {
        return new Promise(resolve => {
          resolve(jsonResponse());
        });
      });

      expect.assertions(13);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test/succeeds/network-only"
          fetchPolicy="network-only"
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      setTimeout(() => {
        expect(beforeFetchMock).toHaveBeenCalledTimes(1);
        expect(beforeFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test/succeeds/network-only'
          })
        );
        expect(afterFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test/succeeds/network-only',
            error: null,
            failed: false,
            didUnmount: false,
            data: {
              books: [1, 42, 150]
            }
          })
        );
        expect(onResponseMock).toHaveBeenCalledTimes(1);
        expect(onResponseMock).toBeCalledWith(
          null,
          expect.objectContaining({
            ok: true,
            status: 200,
            statusText: 'OK',
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
            url="/test/succeeds/network-only"
            fetchPolicy="network-only"
            beforeFetch={beforeFetchMock2}
            afterFetch={afterFetchMock2}
            onResponse={onResponseMock2}
          />
        );

        setTimeout(() => {
          expect(fetchMock.calls('/test/succeeds/network-only').length).toBe(2);
          expect(beforeFetchMock2).toHaveBeenCalledTimes(1);
          expect(beforeFetchMock2).toBeCalledWith(
            expect.objectContaining({
              url: '/test/succeeds/network-only'
            })
          );
          expect(afterFetchMock2).toHaveBeenCalledTimes(1);
          expect(afterFetchMock2).toBeCalledWith(
            expect.objectContaining({
              url: '/test/succeeds/network-only',
              error: null,
              failed: false,
              didUnmount: false,
              data: {
                books: [1, 42, 150]
              }
            })
          );
          expect(onResponseMock2).toHaveBeenCalledTimes(1);
          expect(onResponseMock2).toBeCalledWith(
            null,
            expect.objectContaining({
              ok: true,
              status: 200,
              statusText: 'OK',
              data: {
                books: [1, 42, 150]
              }
            })
          );
          done();
        }, networkTimeout);
      }, networkTimeout);
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
          url="/test/succeeds"
          fetchPolicy="cache-and-network"
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      setTimeout(() => {
        expect(beforeFetchMock).toHaveBeenCalledTimes(1);
        expect(beforeFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test/succeeds'
          })
        );
        expect(afterFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test/succeeds',
            error: null,
            failed: false,
            didUnmount: false,
            data: {
              books: [1, 42, 150]
            }
          })
        );
        expect(onResponseMock).toHaveBeenCalledTimes(1);
        expect(onResponseMock).toBeCalledWith(
          null,
          expect.objectContaining({
            ok: true,
            status: 200,
            statusText: 'OK',
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
            url="/test/succeeds"
            fetchPolicy="cache-and-network"
            beforeFetch={beforeFetchMock2}
            afterFetch={afterFetchMock2}
            onResponse={onResponseMock2}
          />
        );

        setTimeout(() => {
          expect(fetchMock.calls('/test/succeeds').length).toBe(2);
          expect(beforeFetchMock2).toHaveBeenCalledTimes(1);
          expect(beforeFetchMock2).toBeCalledWith(
            expect.objectContaining({
              url: '/test/succeeds'
            })
          );
          expect(afterFetchMock2).toHaveBeenCalledTimes(1);
          expect(afterFetchMock).toBeCalledWith(
            expect.objectContaining({
              url: '/test/succeeds',
              error: null,
              failed: false,
              didUnmount: false,
              data: {
                books: [1, 42, 150]
              }
            })
          );
          // Two calls: the first is for the cache, and the second is
          // for when the network returns success
          expect(onResponseMock2).toHaveBeenCalledTimes(2);
          done();
        }, networkTimeout);
      }, networkTimeout);
    });

    test('handles failure correctly', done => {
      expect.assertions(13);
      const onResponseMock = jest.fn();
      const beforeFetchMock = jest.fn();
      const afterFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test/variable"
          fetchPolicy="cache-and-network"
          beforeFetch={beforeFetchMock}
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      setTimeout(() => {
        expect(beforeFetchMock).toHaveBeenCalledTimes(1);
        expect(beforeFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test/variable'
          })
        );
        expect(afterFetchMock).toHaveBeenCalledTimes(1);
        expect(afterFetchMock).toBeCalledWith(
          expect.objectContaining({
            url: '/test/variable',
            error: null,
            failed: false,
            didUnmount: false,
            data: {
              books: [1, 42, 150]
            }
          })
        );
        expect(onResponseMock).toHaveBeenCalledTimes(1);
        expect(onResponseMock).toBeCalledWith(
          null,
          expect.objectContaining({
            ok: true,
            status: 200,
            statusText: 'OK',
            data: {
              books: [1, 42, 150]
            }
          })
        );

        success = false;

        const onResponseMock2 = jest.fn();
        const beforeFetchMock2 = jest.fn();
        const afterFetchMock2 = jest.fn();

        mount(
          <Fetch
            url="/test/variable"
            fetchPolicy="cache-and-network"
            beforeFetch={beforeFetchMock2}
            afterFetch={afterFetchMock2}
            onResponse={onResponseMock2}
          />
        );

        setTimeout(() => {
          expect(fetchMock.calls('/test/variable').length).toBe(2);
          expect(beforeFetchMock2).toHaveBeenCalledTimes(1);
          expect(beforeFetchMock2).toBeCalledWith(
            expect.objectContaining({
              url: '/test/variable'
            })
          );
          expect(afterFetchMock2).toHaveBeenCalledTimes(1);
          expect(afterFetchMock2).toBeCalledWith(
            expect.objectContaining({
              url: '/test/variable',
              didUnmount: false,
              failed: true,
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
      }, networkTimeout);
    });
  });
});

describe('unsuccessful requests', () => {
  test('it calls afterFetch with the right arguments', done => {
    fetchMock.get(
      '/test/fails',
      new Promise((resolve, reject) => {
        reject({
          message: 'Network error'
        });
      })
    );

    expect.assertions(4);
    const afterFetchMock = jest.fn();

    mount(<Fetch url="/test/fails" afterFetch={afterFetchMock} />);

    setTimeout(() => {
      expect(fetchMock.calls('/test/fails').length).toBe(1);
      expect(afterFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toBeCalledWith(
        expect.objectContaining({
          url: '/test/fails',
          failed: true,
          didUnmount: false
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
  test('it should dispatch one request with the same key before they resolve', () => {
    const beforeFetchMock1 = jest.fn();
    const beforeFetchMock2 = jest.fn();

    shallow(<Fetch url="/test/hangs" beforeFetch={beforeFetchMock1} />);
    shallow(<Fetch url="/test/hangs" beforeFetch={beforeFetchMock2} />);

    expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
    expect(beforeFetchMock2).toHaveBeenCalledTimes(0);
    expect(fetchMock.calls('/test/hangs').length).toBe(1);
  });

  test('it should dispatch two requests, even when the URL is the same, when different keys are specified', () => {
    const beforeFetchMock1 = jest.fn();
    const beforeFetchMock2 = jest.fn();

    shallow(
      <Fetch url="/test/hangs" requestKey="1" beforeFetch={beforeFetchMock1} />
    );
    shallow(
      <Fetch url="/test/hangs" requestKey="2" beforeFetch={beforeFetchMock2} />
    );

    expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
    expect(beforeFetchMock2).toHaveBeenCalledTimes(1);
    expect(fetchMock.calls('/test/hangs').length).toBe(2);
  });

  test('it should dispatch one requests, even when the URL is different, when the same key is specified', () => {
    const beforeFetchMock1 = jest.fn();
    const beforeFetchMock2 = jest.fn();

    shallow(
      <Fetch
        url="/test/hangs/1"
        requestKey="1"
        beforeFetch={beforeFetchMock1}
      />
    );
    shallow(
      <Fetch
        url="/test/hangs/2"
        requestKey="1"
        beforeFetch={beforeFetchMock2}
      />
    );

    expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
    expect(beforeFetchMock2).toHaveBeenCalledTimes(0);
    expect(fetchMock.calls('/test/hangs/1').length).toBe(1);
  });

  test('it should dispatch two requests with the same key before they resolve when dedupe:false is passed to both', () => {
    const beforeFetchMock1 = jest.fn();
    const beforeFetchMock2 = jest.fn();

    shallow(
      <Fetch url="/test/hangs" beforeFetch={beforeFetchMock1} dedupe={false} />
    );
    shallow(
      <Fetch url="/test/hangs" beforeFetch={beforeFetchMock2} dedupe={false} />
    );

    expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
    expect(beforeFetchMock2).toHaveBeenCalledTimes(1);
    expect(fetchMock.calls('/test/hangs').length).toBe(2);
  });

  test('it should dispatch two requests with the same key before they resolve when dedupe:false is passed to just one of them', () => {
    const beforeFetchMock1 = jest.fn();
    const beforeFetchMock2 = jest.fn();

    shallow(<Fetch url="/test/hangs" beforeFetch={beforeFetchMock1} />);
    shallow(
      <Fetch url="/test/hangs" beforeFetch={beforeFetchMock2} dedupe={false} />
    );

    expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
    expect(beforeFetchMock2).toHaveBeenCalledTimes(1);
    expect(fetchMock.calls('/test/hangs').length).toBe(2);
  });

  test('it should dispatch two requests with different keys', () => {
    const beforeFetchMock1 = jest.fn();
    const beforeFetchMock2 = jest.fn();

    shallow(<Fetch url="/test/hangs/1" beforeFetch={beforeFetchMock1} />);
    shallow(<Fetch url="/test/hangs/2" beforeFetch={beforeFetchMock2} />);

    expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
    expect(beforeFetchMock2).toHaveBeenCalledTimes(1);
    expect(fetchMock.calls('/test/hangs/1').length).toBe(1);
    expect(fetchMock.calls('/test/hangs/2').length).toBe(1);
  });

  test('dedupe:false with successful data should return the proper data', done => {
    fetchMock.get(
      '/test/fails/dedupe-false',
      new Promise((resolve, reject) => {
        reject({
          message: 'Network error'
        });
      })
    );

    const beforeFetchMock = jest.fn();
    const afterFetchMock = jest.fn();
    const onResponseMock = jest.fn();
    shallow(
      <Fetch
        url="/test/fails/dedupe-false"
        beforeFetch={beforeFetchMock}
        afterFetch={afterFetchMock}
        onResponse={onResponseMock}
        dedupe={false}
      />
    );

    expect(beforeFetchMock).toHaveBeenCalledTimes(1);
    setTimeout(() => {
      expect(fetchMock.calls('/test/fails/dedupe-false').length).toBe(1);
      expect(afterFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toBeCalledWith(
        expect.objectContaining({
          url: '/test/fails/dedupe-false',
          didUnmount: false,
          failed: true
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

    shallow(<Fetch url="/test/hangs" afterFetch={afterFetchMock} />);

    expect(afterFetchMock).toHaveBeenCalledTimes(0);
  });

  test('it should cancel when a double request is initiated via `doFetch`', () => {
    expect.assertions(3);
    jest.useFakeTimers();
    const afterFetchMock = jest.fn();

    let hasFetched = false;
    shallow(
      <Fetch
        url="/test/hangs"
        afterFetch={afterFetchMock}
        children={({ doFetch }) => {
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
    expect(afterFetchMock.mock.calls[0][0]).toHaveProperty(
      'error.name',
      'AbortError'
    );
  });

  test('it should cancel when a double request is initiated via prop changes', () => {
    fetchMock.get('/test/hangs/double-request', hangingPromise());

    const afterFetchMock = jest.fn();

    const wrapper = shallow(
      <Fetch url="/test/hangs" afterFetch={afterFetchMock} />
    );

    wrapper.setProps({
      url: '/test/hangs/double-request'
    });

    expect(afterFetchMock).toHaveBeenCalledTimes(1);
    expect(afterFetchMock.mock.calls[0][0]).toHaveProperty(
      'error.message',
      'New fetch initiated'
    );
    expect(afterFetchMock.mock.calls[0][0]).toHaveProperty(
      'error.name',
      'AbortError'
    );
  });

  test('it should cancel when the component unmounts', () => {
    const afterFetchMock = jest.fn();

    const wrapper = shallow(
      <Fetch url="/test/hangs" afterFetch={afterFetchMock} />
    );

    wrapper.unmount();

    expect(afterFetchMock).toHaveBeenCalledTimes(1);
    expect(afterFetchMock.mock.calls[0][0]).toHaveProperty(
      'error.message',
      'Component unmounted'
    );
    expect(afterFetchMock.mock.calls[0][0]).toHaveProperty(
      'error.name',
      'AbortError'
    );
    expect(afterFetchMock).toBeCalledWith(
      expect.objectContaining({
        url: '/test/hangs',
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
      mount(
        <Fetch
          url="/test/hangs"
          beforeFetch={beforeFetchMock}
          afterFetchMock={afterFetchMock}
        />
      );
      expect(fetchMock.calls('/test/hangs').length).toBe(1);
      expect(beforeFetchMock).toHaveBeenCalledTimes(1);
      expect(afterFetchMock).toHaveBeenCalledTimes(0);
    });

    test('is false when method is GET, HEAD, or OPTIONS', () => {
      const beforeFetchMock1 = jest.fn();
      const beforeFetchMock2 = jest.fn();
      const afterFetchMock1 = jest.fn();
      const afterFetchMock2 = jest.fn();

      mount(
        <Fetch
          url="/test/hangs"
          method="GET"
          beforeFetch={beforeFetchMock1}
          afterFetch={afterFetchMock1}
        />
      );
      expect(fetchMock.calls('/test/hangs').length).toBe(1);
      expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
      expect(afterFetchMock1).toHaveBeenCalledTimes(0);

      mount(
        <Fetch
          url="/test/hangs"
          method="HEAD"
          beforeFetch={beforeFetchMock2}
          afterFetch={afterFetchMock2}
        />
      );
      expect(fetchMock.calls('/test/hangs').length).toBe(2);
      expect(beforeFetchMock1).toHaveBeenCalledTimes(1);
      expect(afterFetchMock2).toHaveBeenCalledTimes(0);
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
          url="/test/hangs"
          method="POST"
          beforeFetch={beforeFetchMock1}
          afterFetch={afterFetchMock1}
        />
      );
      expect(fetchMock.calls('/test/hangs').length).toBe(0);
      expect(beforeFetchMock1).toHaveBeenCalledTimes(0);
      expect(afterFetchMock1).toHaveBeenCalledTimes(0);

      mount(
        <Fetch
          url="/test/hangs"
          method="PATCH"
          beforeFetch={beforeFetchMock2}
          afterFetch={afterFetchMock2}
        />
      );
      expect(fetchMock.calls('/test/hangs').length).toBe(0);
      expect(beforeFetchMock2).toHaveBeenCalledTimes(0);
      expect(afterFetchMock2).toHaveBeenCalledTimes(0);

      mount(
        <Fetch
          url="/test/hangs"
          method="PUT"
          beforeFetch={beforeFetchMock3}
          afterFetch={afterFetchMock3}
        />
      );
      expect(fetchMock.calls('/test/hangs').length).toBe(0);
      expect(beforeFetchMock3).toHaveBeenCalledTimes(0);
      expect(afterFetchMock3).toHaveBeenCalledTimes(0);

      mount(
        <Fetch
          url="/test/hangs"
          method="DELETE"
          beforeFetch={beforeFetchMock4}
          afterFetch={afterFetchMock4}
        />
      );
      expect(fetchMock.calls('/test/hangs').length).toBe(0);
      expect(beforeFetchMock4).toHaveBeenCalledTimes(0);
      expect(afterFetchMock4).toHaveBeenCalledTimes(0);
    });
  });

  describe('manually specifying it', () => {
    test('it should override the default for "read" methods', () => {
      const beforeFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test/hangs"
          method="GET"
          beforeFetch={beforeFetchMock}
          lazy={true}
        />
      );

      expect(fetchMock.calls('/test/hangs').length).toBe(0);
      expect(beforeFetchMock).toHaveBeenCalledTimes(0);
    });

    test('it should override the default for "write" methods', () => {
      const beforeFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test/hangs"
          method="DELETE"
          beforeFetch={beforeFetchMock}
          lazy={false}
        />
      );

      expect(fetchMock.calls('/test/hangs').length).toBe(1);
      expect(beforeFetchMock).toHaveBeenCalledTimes(1);
    });
  });

  test('it should be respected when the props change', () => {
    fetchMock.get('/test/hangs/double-request2', hangingPromise());

    const afterFetchMock = jest.fn();

    const wrapper = shallow(
      <Fetch url="/test/hangs" afterFetch={afterFetchMock} lazy />
    );

    wrapper.setProps({
      url: '/test/hangs/double-request2'
    });

    expect(fetchMock.calls('/test/hangs').length).toBe(0);
    expect(fetchMock.calls('/test/hangs/double-request2').length).toBe(0);
  });
});
