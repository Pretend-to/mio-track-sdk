import { TrackerConfig } from '../types/index';
import Tracker from '../core/tracker';
import { register, sendCustomEvent, sendViewEvent, sendClickEvent } from '../module';

jest.mock('../core/tracker');

// 重置 TrackerInstance
const resetTrackerInstance = () => {
  // @ts-ignore - 访问私有静态属性进行重置
  require('../module').TrackerInstance.reset();
};

describe('Tracker Module', () => {
  let mockTracker: jest.Mocked<Tracker>;

  beforeEach(() => {
    jest.clearAllMocks();
    resetTrackerInstance();
    mockTracker = new Tracker({} as TrackerConfig) as jest.Mocked<Tracker>;
    (Tracker as jest.MockedClass<typeof Tracker>).mockImplementation(() => mockTracker);
  });

  const mockConfig: TrackerConfig = {
    appId: 'test-app',
    endpoint: 'http://test.com/track',
    uid: 'test-user',
    debug: true
  };

  describe('register', () => {
    it('should initialize tracker with config', () => {
      register(mockConfig);
      expect(Tracker).toHaveBeenCalledWith(mockConfig);
    });
  });

  describe('sendCustomEvent', () => {
    it('should call tracker custom method with correct parameters', () => {
      const eventName = 'test-event';
      const eventData = { key: 'value' };
      
      register(mockConfig);
      mockTracker.custom.mockImplementation(() => {});
      
      sendCustomEvent(eventName, eventData);
      expect(mockTracker.custom).toHaveBeenCalledWith(eventName, eventData);
    });

    it('should throw error when tracker is not initialized', () => {
      resetTrackerInstance();
      expect(() => sendCustomEvent('test', {})).toThrow('Tracker not initialized');
    });
  });

  describe('sendViewEvent', () => {
    it('should call tracker manualView method with correct parameters', () => {
      const eventName = 'page-view';
      
      register(mockConfig);
      mockTracker.manualView.mockImplementation(() => {});
      
      sendViewEvent(eventName);
      expect(mockTracker.manualView).toHaveBeenCalledWith(eventName);
    });

    it('should throw error when tracker is not initialized', () => {
      resetTrackerInstance();
      expect(() => sendViewEvent('test')).toThrow('Tracker not initialized');
    });
  });

  describe('sendClickEvent', () => {
    it('should call tracker manualClick method with correct parameters', () => {
      const eventName = 'button-click';
      
      register(mockConfig);
      mockTracker.manualClick.mockImplementation(() => {});
      
      sendClickEvent(eventName);
      expect(mockTracker.manualClick).toHaveBeenCalledWith(eventName);
    });

    it('should throw error when tracker is not initialized', () => {
      resetTrackerInstance();
      expect(() => sendClickEvent('test')).toThrow('Tracker not initialized');
    });
  });
}); 