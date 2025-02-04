import Config from './config';
import { generateUUID, log } from './utils';

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

    log('auth module inited');
  }

  private loadToken() {
    const token = localStorage.getItem('mtt');
    if (token) {
      // TODO: 验证token是否有效
      this.token = token;
      this.hasRegistered = true;
    } else {
      this.sessionId = generateUUID();
    }
  }

  private async reqToken() {
    const config = this.config.getConfig();
    const data = {
      sessionId: this.sessionId,
      appId: config.appId,
    };
    const res = await fetch(config.endpoint + '/v1/sdk/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const resData = await res.json();
      if (resData.code === 0) {
        this.token = resData.data.token;
        this.hasRegistered = true;
        localStorage.setItem('mtt', this.token);
        return true;
      } else {
        log('register failed');
        this.hasRegistered = false;
        return false;
      }
    } else {
      const code = res.status;
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
