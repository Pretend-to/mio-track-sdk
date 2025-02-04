import { EventEmitter, authedFetch, log, formatDecimal } from './utils';
import {
  RecordData,
  PerformanceEventData,
  PlatformEventData,
  ExceptionEventData,
  OS,
  Browser,
} from '../types/index';

interface DataEvents {
  click?: string[];
  view?: string[];
  custom?: string[];
}

class Loader extends EventEmitter {
  private dataEvents: DataEvents;
  private observer: IntersectionObserver;

  constructor() {
    super();
    this.dataEvents = {};
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const name = entry.target.getAttribute('data-name');
          if (name) {
            this.record('data', { name, type: 'view' });
          }
        }
      });
    });
  }

  private record(
    type: string,
    data: RecordData | PerformanceEventData | ExceptionEventData
  ) {
    this.emit('record', { type, data });
  }

  private loadPerformanceEvent() {
    const data: PerformanceEventData = {
      dnsSearch: 0,
      tcpConnect: 0,
      sslConnect: 0,
      request: 0,
      response: 0,
      parseDomTree: 0,
      domReady: 0,
      interactive: 0,
      complete: 0,
      redirect: 0,
      redirectTime: 0,
      duration: 0,
      fp: 0,
      fcp: 0,
    };

    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
      // Check if navigationEntry exists
      const {
        domainLookupEnd,
        domainLookupStart,
        connectEnd,
        connectStart,
        secureConnectionStart,
        loadEventStart,
        domInteractive,
        domContentLoadedEventEnd,
        duration,
        responseStart,
        requestStart,
        responseEnd,
        fetchStart,
        redirectEnd,
        redirectStart,
        redirectCount,
      } = navigationEntry as PerformanceNavigationTiming;

      const fpEntry = performance
        .getEntriesByType('paint')
        .find(({ name }) => name === 'first-paint');
      const fcpEntry = performance
        .getEntriesByType('paint')
        .find(({ name }) => name === 'first-contentful-paint');

      data.fp = fpEntry?.startTime || 0;
      data.fcp = fcpEntry?.startTime || 0;
      data.dnsSearch = domainLookupEnd - domainLookupStart;
      data.tcpConnect = connectEnd - connectStart;
      data.sslConnect = secureConnectionStart
        ? secureConnectionStart - connectStart
        : 0; // Check if secureConnectionStart exists
      data.request = responseStart - requestStart;
      data.response = responseEnd - responseStart;
      data.parseDomTree = domInteractive - responseEnd;
      data.domReady = domContentLoadedEventEnd - fetchStart;
      data.interactive = domInteractive - fetchStart;
      data.redirect = redirectCount;
      data.redirectTime = redirectEnd - redirectStart;
      data.duration = duration;

      for (const key of Object.keys(data)) {
        data[key as keyof PerformanceEventData] = formatDecimal(
          data[key as keyof PerformanceEventData],
          3
        );
      }
    }

    this.record('performance', data);
  }

  private loadExceptionEvent() {
    // Add your exception event logic here.  Example:
    window.onerror = (event, source, lineno, colno, error) => {
      const data: ExceptionEventData = {
        message: error?.message || event || '', // Get the error message
        source: source || '',
        lineno: lineno || 0,
        colno: colno || 0,
      };
      this.record('exception', data);
    };
  }

  private loadPlatformEvent() {
    const userAgent = navigator.userAgent;
    const data: PlatformEventData = {
      os: this.detectOS(userAgent),
      browser: this.detectBrowser(userAgent),
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      url: window.location.href,
    };

    this.record('data', { type: 'platform', name: 'platform', data });
  }

  private detectOS(userAgent: string): string {
    const osList = {
      Windows: /Windows/i,
      Mac: /Macintosh/i,
      Linux: /Linux/i,
      Android: /Android/i,
      iOS: /iPhone|iPad|iPod/i,
    };

    for (const [os, regex] of Object.entries(osList)) {
      if (regex.test(userAgent)) {
        return os;
      }
    }

    return 'Other';
  }

  private detectBrowser(userAgent: string): string {
    const browserList = {
      Edge: /Edg/i,
      Chrome: /Chrome/i,
      Firefox: /Firefox/i,
      Safari: /Safari/i,
      IE: /MSIE|Trident/i,
      Opera: /OPR/i,
    };

    for (const [browser, regex] of Object.entries(browserList)) {
      if (regex.test(userAgent)) {
        return browser;
      }
    }

    return 'Other';
  }

  public loadViewEvent(dom: HTMLElement, name: string) {
    dom.setAttribute('data-name', name);
    this.observer.observe(dom);
  }

  public loadClickEvent(dom: HTMLElement, name: string) {
    dom.addEventListener('click', () => {
      this.record('data', { name, type: 'click' });
    });
  }

  public loadCustomEvent(name: string, data: object) {
    // Use RecordData or a more specific type if possible

    this.record('data', { data, name, type: 'custom' });
  }

  public async init() {
    const path = '/v1/sdk/data/list';
    try {
      const res = await authedFetch(path, { method: 'GET' });
      if (res.ok) {
        const resData = await res.json();
        if (resData.code === 0) {
          this.dataEvents = resData.data;
          // After initializing dataEvents, load other events
          this.loadPerformanceEvent();
          this.loadExceptionEvent();
          this.loadPlatformEvent();
          console.log(this.dataEvents);
        }
      } else {
        console.error('load data events error:', res.status, res.statusText); // Include status and statusText
      }
    } catch (error) {
      console.error('Error fetching data events:', error);
    }
  }
}

export default Loader;
