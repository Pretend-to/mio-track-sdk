// src/types/index.d.ts
export interface TrackerConfig {
  appId: string;
  endpoint: string;
  uid?: string;
  report_interval?: number;
  max_batch_size?: number;
  debug?: boolean;
}

// 用于异常事件的数据类型
export interface ExceptionEventData {
  message: string | Event;
  source?: string;
  lineno?: number;
  colno?: number;
}

// 用于性能事件的数据类型
export interface PerformanceEventData {
  dnsSearch: number; // DNS 解析耗时
  tcpConnect: number; // TCP 连接耗时
  sslConnect: number; // SSL安全连接耗时
  request: number; // TTFB 网络请求耗时
  response: number; // 数据传输耗时
  parseDomTree: number; // DOM 解析耗时
  domReady: number; // DOM Ready
  interactive: number; // 首次可交互时间
  complete: number; // 页面完全加载
  redirect: number; // 重定向次数
  redirectTime: number; // 重定向耗时
  duration: number; // 资源请求的总耗时 responseEnd-startTime
  fp: number; // 渲染出第一个像素点，白屏时间
  fcp: number; // 渲染出第一个内容，首屏结束时间
}

interface ScreenData {
  width: number;
  height: number;
}

export type OS = 'Windows' | 'Mac' | 'Linux' | 'Android' | 'iOS' | 'Other';

export type Browser =
  | 'Chrome'
  | 'Safari'
  | 'Firefox'
  | 'IE'
  | 'Edge'
  | 'Opera'
  | 'Other';

export interface PlatformEventData {
  os: OS | string; // 操作系统
  browser: Browser | string; // 浏览器
  screen: ScreenData; // 屏幕分辨率
  url: string; // 页面 URL
}

// 定义自定义事件数据结构
export interface DataEventData {
  name: string; // 事件名称
  [key: string]: any; // 允许其他自定义属性
}

export interface RecordData {
  name: string;
  type: 'click' | 'view' | 'custom' | 'platform';
  [key: string]: any;
}

// 定义事件类型和对应数据的映射
export interface TrackEventDataMap {
  exception: ExceptionEventData;
  platform: PlatformEventData;
  click: DataEventData; // 使用ClickEventData
  view: DataEventData; // 使用CvEventData
  custom: DataEventData; // 使用CustomEventData
  performance: PerformanceEventData; // 使用PerformanceEventData
}

export type TrackType = keyof TrackEventDataMap;

// TrackEvent接口
export interface TrackEvent {
  type: TrackType;
  time: number;
  data?: TrackEventDataMap[keyof TrackEventDataMap] | any;
}

export interface EventEmittedData {
  type: 'data' | 'performance' | 'exception';
  data: RecordData | PerformanceEventData | ExceptionEventData;
}
