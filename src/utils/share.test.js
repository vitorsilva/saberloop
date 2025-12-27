import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  canShare,
  canShareFiles,
  shareContent,
  shareWithImage,
  copyToClipboard,
  generateShareUrl,
  generateShareText,
  shareToTwitter,
  shareToFacebook
} from './share.js';

// Mock telemetry
vi.mock('./telemetry.js', () => ({
  telemetry: {
    trackEvent: vi.fn(),
    track: vi.fn()
  }
}));

describe('Share Utilities', () => {
  let originalNavigator;
  let originalWindow;

  beforeEach(() => {
    originalNavigator = global.navigator;
    originalWindow = global.window;
  });

  afterEach(() => {
    global.navigator = originalNavigator;
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  describe('canShare', () => {
    it('should return true when Web Share API is available', () => {
      global.navigator = { share: vi.fn() };
      expect(canShare()).toBe(true);
    });

    it('should return false when navigator is undefined', () => {
      global.navigator = undefined;
      expect(canShare()).toBe(false);
    });

    it('should return false when share is not a function', () => {
      global.navigator = { share: 'not a function' };
      expect(canShare()).toBe(false);
    });
  });

  describe('canShareFiles', () => {
    it('should return true when canShare is available', () => {
      global.navigator = { share: vi.fn(), canShare: vi.fn() };
      expect(canShareFiles()).toBe(true);
    });

    it('should return false when canShare is not available', () => {
      global.navigator = { share: vi.fn() };
      expect(canShareFiles()).toBe(false);
    });
  });

  describe('shareContent', () => {
    it('should call navigator.share with correct options', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      global.navigator = { share: mockShare };

      const result = await shareContent({
        title: 'Test Title',
        text: 'Test text',
        url: 'https://example.com'
      });

      expect(mockShare).toHaveBeenCalledWith({
        title: 'Test Title',
        text: 'Test text',
        url: 'https://example.com'
      });
      expect(result).toBe(true);
    });

    it('should return false when Web Share API is not available', async () => {
      global.navigator = {};
      const result = await shareContent({ title: 'Test', text: 'Test' });
      expect(result).toBe(false);
    });

    it('should return false when user cancels share', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      global.navigator = { share: vi.fn().mockRejectedValue(abortError) };

      const result = await shareContent({ title: 'Test', text: 'Test' });
      expect(result).toBe(false);
    });

    it('should return false when share fails', async () => {
      global.navigator = { share: vi.fn().mockRejectedValue(new Error('Share failed')) };

      const result = await shareContent({ title: 'Test', text: 'Test' });
      expect(result).toBe(false);
    });
  });

  describe('shareWithImage', () => {
    it('should share with image when supported', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      const mockCanShare = vi.fn().mockReturnValue(true);
      global.navigator = { share: mockShare, canShare: mockCanShare };

      const imageBlob = new Blob(['test'], { type: 'image/png' });
      const result = await shareWithImage({
        title: 'Test',
        text: 'Test text',
        url: 'https://example.com',
        imageBlob
      });

      expect(mockCanShare).toHaveBeenCalled();
      expect(mockShare).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should fall back to text share when file sharing not supported', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      global.navigator = { share: mockShare };

      const imageBlob = new Blob(['test'], { type: 'image/png' });
      const result = await shareWithImage({
        title: 'Test',
        text: 'Test text',
        url: 'https://example.com',
        imageBlob
      });

      expect(mockShare).toHaveBeenCalledWith({
        title: 'Test',
        text: 'Test text',
        url: 'https://example.com'
      });
      expect(result).toBe(true);
    });

    it('should fall back when canShare returns false for files', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      const mockCanShare = vi.fn().mockReturnValue(false);
      global.navigator = { share: mockShare, canShare: mockCanShare };

      const imageBlob = new Blob(['test'], { type: 'image/png' });
      const result = await shareWithImage({
        title: 'Test',
        text: 'Test text',
        url: 'https://example.com',
        imageBlob
      });

      // Should call share with text only (fallback)
      expect(result).toBe(true);
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      global.navigator = { clipboard: { writeText: mockWriteText } };

      const result = await copyToClipboard('Test text');

      expect(mockWriteText).toHaveBeenCalledWith('Test text');
      expect(result).toBe(true);
    });

    it('should return false when clipboard API is not available', async () => {
      global.navigator = {};
      const result = await copyToClipboard('Test text');
      expect(result).toBe(false);
    });

    it('should return false when copy fails', async () => {
      global.navigator = {
        clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Copy failed')) }
      };

      const result = await copyToClipboard('Test text');
      expect(result).toBe(false);
    });
  });

  describe('generateShareUrl', () => {
    it('should generate correct share URL', () => {
      const url = generateShareUrl('World History');
      expect(url).toBe('https://saberloop.com/app/?topic=World%20History');
    });

    it('should encode special characters', () => {
      const url = generateShareUrl('Math & Science');
      expect(url).toBe('https://saberloop.com/app/?topic=Math%20%26%20Science');
    });
  });

  describe('generateShareText', () => {
    it('should generate correct share text', () => {
      const text = generateShareText({
        topic: 'History',
        score: 4,
        total: 5,
        percentage: 80
      });

      expect(text).toContain('History Quiz Master');
      expect(text).toContain('4/5');
      expect(text).toContain('80%');
      expect(text).toContain('Can you beat my score?');
    });
  });

  describe('shareToTwitter', () => {
    it('should open Twitter intent URL', () => {
      const mockOpen = vi.fn();
      global.window = { open: mockOpen };

      shareToTwitter('Test tweet', 'https://example.com');

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        '_blank',
        'width=550,height=420'
      );
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('text=Test%20tweet'),
        '_blank',
        'width=550,height=420'
      );
    });
  });

  describe('shareToFacebook', () => {
    it('should open Facebook share URL', () => {
      const mockOpen = vi.fn();
      global.window = { open: mockOpen };

      shareToFacebook('https://example.com');

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com/sharer'),
        '_blank',
        'width=550,height=420'
      );
    });

    it('should include quote when provided', () => {
      const mockOpen = vi.fn();
      global.window = { open: mockOpen };

      shareToFacebook('https://example.com', 'Check this out!');

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('quote=Check%20this%20out'),
        '_blank',
        'width=550,height=420'
      );
    });
  });
});
