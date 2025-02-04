// src/core/config.ts
import { TrackerConfig } from '../types/index';

class Config {
  config: TrackerConfig;

  constructor(config: TrackerConfig) {
    this.config = {
      debug: false,
      ...config,
    };
    localStorage.setItem('mte', this.config.endpoint);
  }

  getConfig(): TrackerConfig {
    return this.config;
  }
  setConfig(config: Partial<TrackerConfig>) {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}

export default Config;
