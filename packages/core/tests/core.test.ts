import { expect, test, vi } from 'vitest';
import { AnalyticsBase, CustomEvent, ErrorCodes } from '../src';

test('should create an Analytics instance', () => {
  const instance = new AnalyticsBase('test_api_key', true);
  expect(instance).toBeInstanceOf(AnalyticsBase);
});

test('debug should log messages when debug is enabled', () => {
  const instance = new AnalyticsBase('test_api_key', true);
  const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  instance.debug('Test message');
  expect(consoleSpy).toHaveBeenCalledWith('Test message');
  consoleSpy.mockRestore();
});

test('error should throw an error when debug is enabled', () => {
  const instance = new AnalyticsBase('test_api_key', true);
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => instance.error('Test error')).toThrow('Test error');
  consoleSpy.mockRestore();
});

test('should return a CustomEvent instance', () => {
  const instance = new AnalyticsBase('test_api_key', true);
  const event = instance.events('my_custom_event');
  expect(event).toBeInstanceOf(CustomEvent);
});

test('should throw an error if the event key is not a string', () => {
  const instance = new AnalyticsBase('test_api_key', true);
  expect(() => instance.events(123 as any)).toThrow(`[DISCORDANALYTICS] ${ErrorCodes.INVALID_VALUE_TYPE}`);
});

test('should update or insert an item in the array', () => {
  const instance = new AnalyticsBase('test_api_key', true);
  const array = [{ id: 1, value: 10 }];
  const update = (item: { value: number }) => { item.value += 5; };
  const insert = () => ({ id: 2, value: 20 });

  instance.updateOrInsert(array, (item) => item.id === 1, update, insert);
  expect(array).toEqual([{ id: 1, value: 15 }]);

  instance.updateOrInsert(array, (item) => item.id === 2, update, insert);
  expect(array).toEqual([{ id: 1, value: 15 }, { id: 2, value: 20 }]);
});

test('should return an object of guild sizes', () => {
  const instance = new AnalyticsBase('test_api_key', true);
  const guilds_member_count = [50, 200, 1000, 3000, 150];
  const result = instance.calculateGuildMembers(guilds_member_count);
  expect(result).toEqual({ little: 1, medium: 2, big: 1, huge: 1 });
});

test('should update the added and removed guilds', () => {
  const instance = new AnalyticsBase('test_api_key', true);
  expect(instance.trackGuilds('create'));
  expect(instance.trackGuilds('delete'));
});
