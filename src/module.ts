import { TrackerConfig } from './types/index';
import Tracker from './core/tracker';

// 单例管理类
class TrackerInstance {
  private static instance: Tracker | null = null;

  // 私有构造函数，防止外部实例化
  private constructor() {}

  /**
   * 注册并初始化 Tracker
   * @param config Tracker配置
   * @returns Tracker实例
   */
  static register(config: TrackerConfig): Tracker {
    if (!this.instance) {
      this.instance = new Tracker(config);
      this.instance.init();    
    }
    return this.instance;
  }

  /**
   * 获取 Tracker 实例
   * @throws Error 如果 Tracker 未初始化
   * @returns Tracker实例
   */
  static getInstance(): Tracker {
    if (!this.instance) {
      throw new Error('Tracker not initialized. Please call register() first.');
    }
    return this.instance;
  }

  /**
   * 检查 Tracker 是否已初始化
   * @returns boolean
   */
  static isInitialized(): boolean {
    return !!this.instance;
  }

  /**
   * 重置 Tracker 实例
   */
  static reset(): void {
    this.instance = null;
  }
}

/**
 * 注册并初始化 Tracker
 * @param config Tracker配置
 */
function register(config: TrackerConfig): void {
  TrackerInstance.register(config);
  console.log('Tracker registered and initialized.');
}

/**
 * 发送自定义事件
 * @param name 事件名称
 * @param data 事件数据
 */
function sendCustomEvent(name: string, data: object): void {
  try {
    TrackerInstance.getInstance().custom(name, data);
  } catch (error) {
    console.error('Failed to send custom event:', error);
    throw error;
  }
}

/**
 * 发送页面浏览事件
 * @param name 事件名称
 */
function sendViewEvent(name: string): void {
  try {
    TrackerInstance.getInstance().manualView(name);
  } catch (error) {
    console.error('Failed to send view event:', error);
    throw error;
  }
}

/**
 * 发送点击事件
 * @param name 事件名称
 */
function sendClickEvent(name: string): void {
  try {
    TrackerInstance.getInstance().manualClick(name);
  } catch (error) {
    console.error('Failed to send click event:', error);
    throw error;
  }
}

/**
 * 注册DOM浏览事件
 * @param name 事件名称
 * @param dom DOM元素
 */
function registerViewEvent(name: string, dom: HTMLElement): void {
  try {
    TrackerInstance.getInstance().view(name, dom);
  } catch (error) {
    console.error('Failed to register view event:', error);
    throw error;
  }
}

/**
 * 注册DOM点击事件
 * @param name 事件名称
 * @param dom DOM元素
 */
function registerClickEvent(name: string, dom: HTMLElement): void {
  try {
    TrackerInstance.getInstance().click(name, dom);
  } catch (error) {
    console.error('Failed to register click event:', error);
    throw error;
  }
}

/**
 * 添加通用参数
 * @param data 通用参数数据
 */
function addCommonParams(data: Record<string, any>): void {
  try {
    TrackerInstance.getInstance().addCommonParams(data);
  } catch (error) {
    console.error('Failed to add common params:', error);
    throw error;
  }
}

// 导出工具函数
export {
  register,
  sendCustomEvent,
  sendViewEvent,
  sendClickEvent,
  registerViewEvent,
  registerClickEvent,
  addCommonParams,
  // 导出 TrackerInstance 以支持更多高级用法
  TrackerInstance
};