import { Lambda } from 'API/AWSApi';
import { invoke } from 'Utils/LambdaUtils';

jest.mock('API/AWSApi');

describe('.invoke', () => {
  let subject;
  let mockInvoke;

  beforeAll(() => {
    const mockPromise = jest.fn().mockResolvedValue({
      Payload: JSON.stringify({
        code: 'OK',
        message: 'test successful',
        statusCode: 200,
      }),
    });
    mockInvoke = jest.fn(() => ({ promise: mockPromise }));
    Lambda.mockImplementation(() => ({
      invoke: mockInvoke,
    }));
  });

  describe('when context not provided', () => {
    beforeAll(async () => {
      subject = await invoke({
        serviceName: 'test-api',
        functionName: 'testFn',
        payload: { a: 1, b: 2 },
      });
    });

    test('calls Lambda#invoke with correct params', () => {
      expect(mockInvoke).toHaveBeenCalledWith(
        expect.objectContaining({
          ClientContext: 'e30=',
          FunctionName: 'test-api-test-testFn',
          InvocationType: 'RequestResponse',
          Payload: JSON.stringify({
            body: JSON.stringify({ a: 1, b: 2 }),
          }),
          LogType: 'Tail',
        })
      );
    });

    test('returns response from lambda', () => {
      expect(subject).toEqual({
        code: 'OK',
        message: 'test successful',
        statusCode: 200,
      });
    });
  });

  describe('when context provided', () => {
    beforeAll(async () => {
      subject = await invoke({
        serviceName: 'test-api',
        functionName: 'testFn',
        payload: { a: 1, b: 2 },
        context: {
          event: {
            headers: {
              Authorization: 'Bearer test',
            },
          },
        },
      });
    });

    test('calls Lambda#invoke with correct params', () => {
      expect(mockInvoke).toHaveBeenCalledWith(
        expect.objectContaining({
          ClientContext: 'e30=',
          FunctionName: 'test-api-test-testFn',
          InvocationType: 'RequestResponse',
          Payload: JSON.stringify({
            headers: {
              authorization: 'Bearer test',
            },
            body: JSON.stringify({ a: 1, b: 2 }),
          }),
          LogType: 'Tail',
        })
      );
    });

    test('returns response from lambda', () => {
      expect(subject).toEqual({
        code: 'OK',
        message: 'test successful',
        statusCode: 200,
      });
    });
  });

  describe('when IS_OFFLINE is false', () => {
    const OLD_ENV = process.env;

    beforeAll(async () => {
      process.env = {
        ...OLD_ENV,
        IS_OFFLINE: 'false',
      };
      subject = await invoke({
        serviceName: 'test-api',
        functionName: 'testFn',
        payload: { a: 1, b: 2 },
        context: {
          event: {
            headers: {
              Authorization: 'Bearer test',
            },
          },
        },
      });
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    test('calls Lambda#invoke with correct params', () => {
      expect(mockInvoke).toHaveBeenCalledWith(
        expect.objectContaining({
          ClientContext: 'e30=',
          FunctionName: 'test-api-test-testFn',
          InvocationType: 'RequestResponse',
          Payload: JSON.stringify({
            headers: {
              authorization: 'Bearer test',
            },
            body: JSON.stringify({ a: 1, b: 2 }),
          }),
          LogType: 'Tail',
        })
      );
    });

    test('returns response from lambda', () => {
      expect(subject).toEqual({
        code: 'OK',
        message: 'test successful',
        statusCode: 200,
      });
    });
  });
});
