import Config from './config';
import { generateUUID, log, requestToken  } from './utils';
import { AuthConfig } from '../types/index';

class Auth {
  private config: Config;
  private sessionId: string;
  private hasRegistered: boolean;
  private token: string;

  constructor(config: Config) {
    this.config = config;
    this.hasRegistered = false;
    this.sessionId = '';
    this.token = '';
  }

  private loadToken() {
    const token = localStorage.getItem('mtt');
    if (token) {
      // TODO: 验证token是否有效
      this.token = token;
      this.hasRegistered = true;
    } else {
      const sessionId = localStorage.getItem('mts');
      if (sessionId) {
        this.sessionId = sessionId;
      } else {
        this.sessionId = generateUUID();
        localStorage.setItem('mts', this.sessionId);
      }
    }
  }

  private reset() {
    this.hasRegistered = false;
    this.sessionId = '';
    this.token = '';
    localStorage.removeItem('mtt');
  }

  public logout() {
    this.config.setConfig({
      uid: '',
    });
    this.reset();
  }

  public login(uid: string) {
    this.config.setConfig({
      uid,
    });
    this.reqToken();
  }

  private async reqToken() {
    const config = this.config.getConfig();
    const data : AuthConfig = {
      uid: config.uid || undefined,
      sessionId: this.sessionId,
      appId: config.appId,
    };
    try {
      this.token = await requestToken(data)
      this.hasRegistered = true;
      localStorage.setItem('mtt', this.token);
      return true;
    } catch (e: any) {
      const code = e.code;
      switch (code) {
        case 404:
          log('appId not found');
          break;
        case 500:
          log('server error');
          break;
        default:
          log('unknow error');
          break;
      }      
      this.hasRegistered = false;
      return false;
    }
  }

  public async register() {
    this.loadToken();
    if (this.hasRegistered) {
      return;
    } else {
      const res = await this.reqToken();
      if (!res) {
        log('auth failed');
      }
    }
  }

  public getToken() {
    return this.token;
  }
}

export default Auth;
