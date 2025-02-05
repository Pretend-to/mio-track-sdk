// src/core/event.ts
import { TrackEvent, TrackType, TrackEventDataMap } from '../types/index';
import Config from './config';
import { authedFetch, log } from './utils';

const EventTypes = {
  click: 'click',
  view: 'view',
  custom: 'custom',
  platform: 'platform',
  exception: 'exception',
  performance: 'performance',
};

const TrackPath = {
  data: '/v1/sdk/data/report',
  performance: '/v1/sdk/performance/report',
  exception: '/v1/sdk/exception/report',
};

class Event {
  private config: Config;
  private token: string;

  constructor(config: Config) {
    this.config = config;
    this.token = '';
  }

  public record(
    type: TrackType,
    data?: TrackEventDataMap[keyof TrackEventDataMap]
  ) {
    try {
      const event: TrackEvent = {
        type,
        time: Date.now(),
        data: data,
      };
      this.send(event);
    } catch (e) {
      log(`record event error: ${e}`);
    }
  }

  private async send(event: TrackEvent) {
    const config = this.config.getConfig();
    let path = '';
    if (config.debug) {
      log('send event:', event);
    }
    if (
      event.type === EventTypes.click ||
      event.type === EventTypes.view ||
      event.type === EventTypes.custom ||
      event.type === EventTypes.platform
    ) {
      path = TrackPath.data;
    } else if (event.type === EventTypes.performance) {
      path = TrackPath.performance;
    } else if (event.type === EventTypes.exception) {
      path = TrackPath.exception;
    } else {
      log('unknown event type');
      return;
    }
    const res = await authedFetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    if (res.ok) {
      const resData = await res.json();
      if (resData.code === 0) {
        log('send event success');
      } else {
        log('send event failed');
      }
    } else {
      if (res.status === 401) {
        log('token is invalid');
      } else {
        log('send event failed');
      }
    }
  }
}

export default Event;
