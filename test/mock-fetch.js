export function hangs() {
  return {
    then() {},
    catch() {}
  };
}

export function succeeds() {
  return {
    then(cb) {
      cb({
        headers: {},
        ok: true,
        redirect: false,
        status: 200,
        statusText: 'OK',
        type: 'basic',
        url: '/test',
        json() {
          return {
            then(cb) {
              cb({
                books: [1, 42, 150]
              });
            },
            catch() {}
          };
        },
        text() {
          return {
            then(cb) {
              cb('This is some text lol');
            },
            catch() {}
          };
        }
      });
    },
    catch() {
      return jest.fn().mockReturnValue(hangs());
    }
  };
}

export function fails() {
  return {
    then(onSuccess, onError) {
      onError(new TypeError('Network error'));
      return jest.fn().mockReturnValue(hangs());
    },
    catch(cb) {
      return jest.fn().mockReturnValue(hangs());
    }
  };
}
