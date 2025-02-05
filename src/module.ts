import { TrackerConfig } from './types/index';
import Tracker from './core/tracker';

let tracker: Tracker | null = null;

function register(config: TrackerConfig) {
  tracker = new Tracker(config);
}

function sendCustomEvent(name: string, data: object) {
  if (tracker) {
    tracker.custom(name, data)
  }
}

function sendViewEvent(name: string) {
  if (tracker) {
    tracker.manualView(name)
  }
}

function sendClickEvent(name: string) {
  if (tracker) {
    tracker.manualClick(name)
  }
}

function registerViewEvent(name: string, dom: HTMLElement) {
  if (tracker) {
    tracker.view(name, dom)
  }
}
function registerClickEvent(name: string, dom: HTMLElement) {
  if (tracker) {
    tracker.click(name, dom)
  }
}

function addCommonParams(data: Record<string, any>) {
  if (tracker) {
    tracker.addCommonParams(data)
  }
}

export {
  register,
  sendCustomEvent,
  sendViewEvent,
  sendClickEvent,
  registerViewEvent,
  registerClickEvent,
  addCommonParams
}