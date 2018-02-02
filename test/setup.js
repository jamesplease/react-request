import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { hangs } from './mock-fetch';

Enzyme.configure({ adapter: new Adapter() });

// We need an AbortSignal that can be instantiated without
// an error.
global.AbortSignal = function() {};

// We do this at the start of each test, just in case a test
// replaces the global fetch and does not reset it
beforeEach(() => {
  global.fetch = jest.fn().mockReturnValue(hangs());
});
