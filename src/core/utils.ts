import { TrackEvent, AuthConfig } from '../types/index';

// src/core/utils.ts
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const log = (message: string, ...args: any[]) => {
  if (console && console.log) {
    console.log(`[tracker-sdk]: ${message}`, ...args);
  }
};

export const isBrowser = () =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

export const authedFetch = async (path: string, options: RequestInit) => {
  const token = localStorage.getItem('mtt');
  const endpoint = localStorage.getItem('mte');
  if (token && endpoint) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  } else {
    return Promise.reject(new Error('token or endpoint is not set'));
  }
  return fetch(`${endpoint + path}`, options);
};



export const requestToken = async (config: AuthConfig) => {
  const endpoint = localStorage.getItem('mte');
  const res = await fetch(endpoint + '/v1/sdk/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  if (res.ok) {
    const data = await res.json();
    return data.data.token;
  } else {
    const code = res.status;
    return Promise.reject({code});
  }
}

export const formatDecimal = (num: number, decimal: number) => {
  if (!isFinite(num) || isNaN(num)) {
    return num; // 对于 NaN 和 Infinity 直接返回原始数值
  }

  if (!Number.isInteger(decimal) || decimal < 0) {
    return num; // 如果小数位数无效，返回原始数值
  }

  return parseFloat(num.toFixed(decimal));
};

export class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  constructor() {
    this.events = {};
  }

  /**
   * Registers a listener for a specific event name.
   * Existing listeners for that event will be removed before adding the new one.
   *
   * @param eventName The name of the event to listen for.
   * @param listener The callback function to be executed when the event is emitted.
   */
  on(eventName: string, listener: Function): void {
    // Remove previous callbacks
    this.off(eventName);
    // Add new callback function
    this.events[eventName] = [listener];
  }

  /**
   * Emits an event with the provided data.
   *
   * @param eventName The name of the event to emit.
   * @param data The data to pass to the listener.
   */
  emit(eventName: string, data: any): void {
    if (this.events[eventName]) {
      this.events[eventName].forEach((listener) => {
        listener(data);
      });
    }
  }

  /**
   * Removes all listeners for a specific event name.
   *
   * @param eventName The name of the event.
   */
  off(eventName: string): void {
    if (this.events[eventName]) {
      delete this.events[eventName];
    }
  }
}

export class eventsQueue {
  private queue: TrackEvent[] = [];
  private max: number;

  constructor(max_batch_size?: number) {
    this.queue = [];
    this.max = max_batch_size ?? 10;

    const stroge = localStorage.getItem('mteq');
    if (stroge) {
      this.queue = JSON.parse(stroge);
    }

  }

  public push(event: TrackEvent): void {
    this.queue.push(event);
    this.setStroge();
  }

  private setStroge() {
    localStorage.setItem('mteq', JSON.stringify(this.queue));
  }

  public pop() : TrackEvent[]{
    const events = this.queue.slice(0, this.max);
    this.queue = this.queue.slice(this.max);
    this.setStroge();
    return events;
  }

  public clear() {
    this.queue = [];
    this.setStroge();
  }
}