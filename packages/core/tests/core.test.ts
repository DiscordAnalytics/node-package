import { expect, test, vi } from 'vitest';
import { AnalyticsBase, ApiEndpoints, CustomEvent, ErrorCodes } from '../src';

test('should create an Analytics instance', () => {
  const instance = new AnalyticsBase('test_api_key', ApiEndpoints.BASE_URL, true);
  expect(instance).toBeInstanceOf(AnalyticsBase);
});

test('debug should log messages when debug is enabled', () => {
  const instance = new AnalyticsBase('test_api_key', ApiEndpoints.BASE_URL, true);
  const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  instance.debug('Test message');
  expect(consoleSpy).toHaveBeenCalledWith('Test message');
  consoleSpy.mockRestore();
});

test('error should throw an error when debug is enabled', () => {
  const instance = new AnalyticsBase('test_api_key', ApiEndpoints.BASE_URL, true);
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  instance.error('Test error');
  expect(consoleSpy).toHaveBeenCalledWith('Test error');
  consoleSpy.mockRestore();
});

test('should return a CustomEvent instance', () => {
  const instance = new AnalyticsBase('test_api_key', ApiEndpoints.BASE_URL, true);
  const event = instance.events('my_custom_event');
  expect(event).toBeInstanceOf(CustomEvent);
});

test('should update the event value', () => {
  const instance = new AnalyticsBase('test_api_key', ApiEndpoints.BASE_URL, true);
  const event = instance.events('my_custom_event');
  event.set(42);
  event.increment(8);
  event.decrement(1);
  expect(event.get()).toBe(49);
});

test('should throw an error when decrementing a never-set event below zero', () => {
  const instance = new AnalyticsBase('test_api_key', ApiEndpoints.BASE_URL, true);
  const event = instance.events('unset_custom_event');
  expect(() => event.decrement(1)).toThrow(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_EVENTS_COUNT}`);
});

test('should throw an error if the event key is not a string', () => {
  const instance = new AnalyticsBase('test_api_key', ApiEndpoints.BASE_URL, true);
  expect(() => instance.events(123 as unknown as string)).toThrow(
    `[DISCORDANALYTICS] ${ErrorCodes.INVALID_VALUE_TYPE}`,
  );
});

test('should update or insert an item in the array', () => {
  const instance = new AnalyticsBase('test_api_key', ApiEndpoints.BASE_URL, true);
  const array = [{ id: 1, value: 10 }];
  const update = (item: { value: number }) => {
    item.value += 5;
  };
  const insert = () => ({ id: 2, value: 20 });

  instance.updateOrInsert(array, (item) => item.id === 1, update, insert);
  expect(array).toEqual([{ id: 1, value: 15 }]);

  instance.updateOrInsert(array, (item) => item.id === 2, update, insert);
  expect(array).toEqual([
    { id: 1, value: 15 },
    { id: 2, value: 20 },
  ]);
});

test('should return an object of guild sizes', () => {
  const instance = new AnalyticsBase('test_api_key', ApiEndpoints.BASE_URL, true);
  const guilds_member_count = [50, 200, 1000, 3000, 150];
  const result = instance.calculateGuildMembers(guilds_member_count);
  expect(result).toEqual({ little: 1, medium: 2, big: 1, huge: 1 });
});

test('should update the added and removed guilds', () => {
  const instance = new AnalyticsBase('test_api_key', ApiEndpoints.BASE_URL, true);
  expect(instance.trackGuilds('create'));
  expect(instance.trackGuilds('delete'));
});

test('api_call_with_retries should retry on a transient error status and eventually succeed', async () => {
  const instance = new AnalyticsBase('test_api_key', ApiEndpoints.BASE_URL, true);
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const successResponse = new Response('ok', { status: 200 });
  const fetchSpy = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(new Response('server error', { status: 500 }))
    .mockResolvedValueOnce(successResponse);

  const result = await instance.api_call_with_retries('GET', '/test', undefined, 5, 0);

  expect(fetchSpy).toHaveBeenCalledTimes(2);
  expect(result).toBe(successResponse);

  fetchSpy.mockRestore();
  consoleSpy.mockRestore();
});

test('api_call_with_retries should not retry on a 401 response', async () => {
  const instance = new AnalyticsBase('test_api_key', ApiEndpoints.BASE_URL, true);
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const fetchSpy = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response('unauthorized', { status: 401 }));

  const result = await instance.api_call_with_retries('GET', '/test', undefined, 5, 0);

  expect(fetchSpy).toHaveBeenCalledTimes(1);
  expect(result).toBeUndefined();
  expect(consoleSpy).toHaveBeenCalledWith(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_API_TOKEN}`);

  fetchSpy.mockRestore();
  consoleSpy.mockRestore();
});

test('should not double count the remote value when the same event key is requested concurrently', async () => {
  vi.stubEnv('NODE_ENV', 'production');

  const fetchMock = vi.fn(
    () =>
      new Promise<Response>((resolve) =>
        setTimeout(
          () => resolve(new Response(JSON.stringify({ currentValue: 5 }), { status: 200 })),
          20,
        ),
      ),
  );
  vi.stubGlobal('fetch', fetchMock);

  const instance = new AnalyticsBase('test_api_key', ApiEndpoints.BASE_URL, true);

  // Simulates two concurrent event triggers, each doing
  // `analytics.events('race_event').increment(1)`, before either instance's
  // background fetch of the current server-side value has resolved.
  const event1 = instance.events('race_event');
  const event2 = instance.events('race_event');
  event1.increment(1);
  event2.increment(1);

  await new Promise((resolve) => setTimeout(resolve, 100));

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(instance.stats_data.customEvents['race_event']).toBe(7);

  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
