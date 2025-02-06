// src/core/event.ts
import { TrackEvent, TrackType, TrackEventDataMap, TrackerConfig, DataEventData } from '../types/index';
import Config from './config';
import { authedFetch, log, eventsQueue } from './utils';

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
  private config: TrackerConfig;
  private eventsQueue: eventsQueue;
  private reportInterval: NodeJS.Timeout | null;
  private customDataParams: Record<string, any>;

  constructor(config: Config) {
    this.config = config.getConfig();
    this.eventsQueue = new eventsQueue(this.config?.max_batch_size);
    this.reportInterval = null;
    this.customDataParams = {};
  }

  public record(
    type: TrackType,
    data?: TrackEventDataMap[keyof TrackEventDataMap]
  ) {

    const event: TrackEvent = {
      type,
      time: Date.now(),
      data: data,
    };

    // TODO: 解决 ts 逆天错误
    if (type === EventTypes.click || type === EventTypes.view) {
      const data = {
        name: DataTransfer.name,
        params: {
         ...this.customDataParams,
        }
      } as DataEventData;
      event.data = { ...data };
    } else if (type === EventTypes.custom) {
      const data = {
       name: event.data.name,
       params: {
        ...event.data.data,
        ...this.customDataParams,
       }
      } as DataEventData;
      event.data = { ...data };
    }

    this.eventsQueue.push(event);

    if (!this.reportInterval) {
      this.reportInterval = setInterval(() => {
        const events = this.eventsQueue.pop();
        if (events.length > 0) {
          this.send(events);
        }
      }, this.config?.report_interval || 5000);
    }


  }

  public addCommonParams(params: Record<string, any>) {
    this.customDataParams = params;
  }

  private async send(events: TrackEvent[]) {
    let path = '';
    const dataEvents: TrackEvent[] = [];
    const performanceEvents: TrackEvent[] = [];
    const exceptionEvents: TrackEvent[] = [];

    events.forEach((event) => {
      if (event.type === EventTypes.click || event.type === EventTypes.view || event.type === EventTypes.custom || event.type === EventTypes.platform) {
        dataEvents.push(event);
      } else if (event.type === EventTypes.performance) {
        performanceEvents.push(event);
      } else if (event.type === EventTypes.exception) {
        exceptionEvents.push(event);
      } else {
        log('unknown event type');
      }
    });

    if (dataEvents.length > 0) {
      path = TrackPath.data;
      this.sendEvents(path, dataEvents);
    }
    if (performanceEvents.length > 0) {
      path = TrackPath.performance;
      this.sendEvents(path, performanceEvents);
    }
    if (exceptionEvents.length > 0) {
      path = TrackPath.exception;
      this.sendEvents(path, exceptionEvents);
    }

  }

  private async sendEvents(path: string, events: TrackEvent[]) {
    const res = await authedFetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ list: events }),
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

      // 将事件重新加入队列
      for (let i = 0; i < events.length; i++) {
        this.eventsQueue.push(events[i]);
      }

    }
  }
}


export default Event;
