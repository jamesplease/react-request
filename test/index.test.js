import React from 'react';
import { shallow, mount } from 'enzyme';
import { Fetch, clearRequestCache, clearResponseCache } from '../src';
import { hangs, succeeds, fails } from './mock-fetch';

beforeEach(() => {
  clearRequestCache();
  clearResponseCache();
  jest.useFakeTimers();
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

describe('successful requests', () => {
  beforeEach(() => {
    setupSuccessfulResponse();
  });

  test('it calls afterFetch with the right arguments', done => {
    expect.assertions(3);
    const beforeFetchMock = jest.fn();
    const afterFetchMock = jest.fn();

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
      expect.assertions(3);
      const onResponseMock = jest.fn();
      const afterFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test"
          requestName="meepmeep"
          fetchPolicy="cache-only"
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
        />
      );

      Promise.resolve()
        .then(() => {
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
      expect.assertions(7);
      const onResponseMock = jest.fn();
      const afterFetchMock = jest.fn();

      // First, we need to add some stuff to the cache
      mount(
        <Fetch
          url="/test"
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
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

          mount(
            <Fetch
              fetchPolicy="cache-only"
              url="/test"
              afterFetch={afterFetchMock}
              onResponse={onResponseMock}
            />
          );

          Promise.resolve()
            .then(() => {
              expect(global.fetch).toHaveBeenCalledTimes(1);
              expect(afterFetchMock).toHaveBeenCalledTimes(1);
              expect(onResponseMock).toHaveBeenCalledTimes(2);
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
      expect.assertions(7);
      const onResponseMock = jest.fn();
      const afterFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test"
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
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

          mount(
            <Fetch
              url="/test"
              afterFetch={afterFetchMock}
              onResponse={onResponseMock}
            />
          );

          Promise.resolve()
            .then(() => {
              expect(global.fetch).toHaveBeenCalledTimes(1);
              expect(afterFetchMock).toHaveBeenCalledTimes(1);
              expect(onResponseMock).toHaveBeenCalledTimes(2);
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
      expect.assertions(7);
      const onResponseMock = jest.fn();
      const afterFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test"
          fetchPolicy="network-only"
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
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

          mount(
            <Fetch
              url="/test"
              fetchPolicy="network-only"
              afterFetch={afterFetchMock}
              onResponse={onResponseMock}
            />
          );

          Promise.resolve()
            .then(() => {
              expect(global.fetch).toHaveBeenCalledTimes(2);
              expect(afterFetchMock).toHaveBeenCalledTimes(2);
              expect(onResponseMock).toHaveBeenCalledTimes(2);
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
      expect.assertions(7);
      const onResponseMock = jest.fn();
      const afterFetchMock = jest.fn();

      mount(
        <Fetch
          url="/test"
          fetchPolicy="cache-and-network"
          afterFetch={afterFetchMock}
          onResponse={onResponseMock}
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

          mount(
            <Fetch
              url="/test"
              fetchPolicy="cache-and-network"
              afterFetch={afterFetchMock}
              onResponse={onResponseMock}
            />
          );

          Promise.resolve()
            .then(() => {
              expect(global.fetch).toHaveBeenCalledTimes(2);
              expect(afterFetchMock).toHaveBeenCalledTimes(2);
              expect(onResponseMock).toHaveBeenCalledTimes(3);
              done();
            })
            .catch(done.fail);
        })
        .catch(done.fail);
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

    Promise.resolve()
      .then(() => {
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
      })
      .catch(done.fail);
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

// Todo: check if a fetch is called on mount instead
describe('laziness', () => {
  describe('defaults', () => {
    test('is false when just a URL is passed', () => {
      const beforeFetchMock = jest.fn();
      const wrapper = mount(
        <Fetch url="/test" beforeFetch={beforeFetchMock} />
      );
      expect(beforeFetchMock).toHaveBeenCalledTimes(1);
    });

    test('is false when method is GET, HEAD, or OPTIONS', () => {
      const beforeFetchMock1 = jest.fn();
      const beforeFetchMock2 = jest.fn();
      const beforeFetchMock3 = jest.fn();

      mount(<Fetch url="/test" method="GET" beforeFetch={beforeFetchMock1} />);
      expect(beforeFetchMock1).toHaveBeenCalledTimes(1);

      mount(<Fetch url="/test" method="HEAD" beforeFetch={beforeFetchMock2} />);
      expect(beforeFetchMock1).toHaveBeenCalledTimes(1);

      mount(
        <Fetch url="/test" method="OPTIONS" beforeFetch={beforeFetchMock3} />
      );
      expect(beforeFetchMock3).toHaveBeenCalledTimes(1);
    });

    test('is true when method is POST, PATCH, PUT, or DELETE', () => {
      const beforeFetchMock1 = jest.fn();
      const beforeFetchMock2 = jest.fn();
      const beforeFetchMock3 = jest.fn();
      const beforeFetchMock4 = jest.fn();

      mount(<Fetch url="/test" method="POST" beforeFetch={beforeFetchMock1} />);
      expect(beforeFetchMock1).toHaveBeenCalledTimes(0);

      mount(
        <Fetch url="/test" method="PATCH" beforeFetch={beforeFetchMock2} />
      );
      expect(beforeFetchMock1).toHaveBeenCalledTimes(0);

      mount(<Fetch url="/test" method="PUT" beforeFetch={beforeFetchMock1} />);
      expect(beforeFetchMock1).toHaveBeenCalledTimes(0);

      mount(
        <Fetch url="/test" method="DELETE" beforeFetch={beforeFetchMock2} />
      );
      expect(beforeFetchMock1).toHaveBeenCalledTimes(0);
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

      expect(beforeFetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
