// src/core/tracker.ts
import Config from './config';
import Event from './event';
import Auth from './auth';
import Loader from './loader';
import { log } from './utils';
import { TrackerConfig, EventEmittedData, RecordData } from '../types/index';
class Tracker {
  private config: Config;
  private event: Event;
  private auth: Auth;
  private avaliable: boolean;
  private loader: Loader;

  constructor(config: TrackerConfig) {
    this.config = new Config(config);
    this.event = new Event(this.config);
    this.auth = new Auth(this.config);
    this.loader = new Loader();
    this.avaliable = false;
  }

  public async init() {
    await this.auth.register();
    const token = this.auth.getToken();
    if (!token) {
      log('token is not set');
      return;
    }
    this.avaliable = true;
    log('tracker init success');
    this.enableEventEmit();

    await this.loader.init();
  }

  private enableEventEmit() {
    this.loader.on('record', (e: EventEmittedData) => {
      if (e.type == 'data') {
        const data = e.data as RecordData;
        this.event.record(data.type, { name: data.name, data: data.data });
      } else if (e.type == 'performance') {
        this.event.record(e.type, e.data);
      } else if (e.type == 'exception') {
        this.event.record(e.type, e.data);
      }
    });
  }

  public addCommonParams(params: Record<string, any>) {
    this.event.addCommonParams(params);
  }

  public view(name: string, dom: HTMLElement) {
    this.loader.loadViewEvent(dom, name);
  }

  public click(name: string, dom: HTMLElement) {
    this.loader.loadClickEvent(dom, name);
  }

  public custom(name: string, data: any) {
    this.loader.loadCustomEvent(name, data);
  }

  public manualView(name: string) {
    this.event.record('view', { name, type: 'view' });
  }

  public manualClick(name: string) {
    this.event.record('click', { name, type: 'click' });
  }

}

export default Tracker;
