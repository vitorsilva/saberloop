/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoomCodeDisplay, formatRoomCode } from './RoomCodeDisplay.js';

// Mock dependencies
vi.mock('../core/i18n.js', () => ({
  t: (key) => {
    const translations = {
      'party.code': 'Room Code',
      'party.copyCode': 'Copy Code',
      'party.codeCopied': 'Code copied!',
      'party.showQR': 'QR Code',
      'party.shareNative': 'Share...',
    };
    return translations[key] || key;
  },
}));

vi.mock('../utils/share.js', () => ({
  copyToClipboard: vi.fn().mockResolvedValue(true),
  shareContent: vi.fn().mockResolvedValue(true),
}));

describe('RoomCodeDisplay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('formatRoomCode', () => {
    it('should format 6-character code with middle dash', () => {
      expect(formatRoomCode('ABCDEF')).toBe('ABC-DEF');
    });

    it('should handle already formatted code', () => {
      expect(formatRoomCode('ABC-DEF')).toBe('ABC-DEF');
    });

    it('should handle short codes without dash', () => {
      expect(formatRoomCode('ABC')).toBe('ABC');
    });

    it('should handle empty string', () => {
      expect(formatRoomCode('')).toBe('');
    });
  });

  describe('createRoomCodeDisplay', () => {
    it('should create display element with formatted code', () => {
      const display = createRoomCodeDisplay('ABCDEF');

      expect(display).toBeInstanceOf(HTMLElement);
      expect(display.textContent).toContain('ABC-DEF');
    });

    it('should include copy button when showCopy is true', () => {
      const display = createRoomCodeDisplay('ABCDEF', { showCopy: true });

      const copyButton = display.querySelector('[data-testid="copy-code-btn"]');
      expect(copyButton).not.toBeNull();
      expect(copyButton.textContent).toContain('Copy Code');
    });

    it('should not include copy button when showCopy is false', () => {
      const display = createRoomCodeDisplay('ABCDEF', { showCopy: false });

      const copyButton = display.querySelector('[data-testid="copy-code-btn"]');
      expect(copyButton).toBeNull();
    });

    it('should include share button when showShare is true', () => {
      const display = createRoomCodeDisplay('ABCDEF', { showShare: true });

      const shareButton = display.querySelector('[data-testid="share-code-btn"]');
      expect(shareButton).not.toBeNull();
      expect(shareButton.textContent).toContain('Share');
    });

    it('should not include share button when showShare is false', () => {
      const display = createRoomCodeDisplay('ABCDEF', { showShare: false });

      const shareButton = display.querySelector('[data-testid="share-code-btn"]');
      expect(shareButton).toBeNull();
    });

    it('should call copyToClipboard when copy button clicked', async () => {
      const { copyToClipboard } = await import('../utils/share.js');
      const display = createRoomCodeDisplay('ABCDEF', { showCopy: true });

      const copyButton = display.querySelector('[data-testid="copy-code-btn"]');
      copyButton.click();

      expect(copyToClipboard).toHaveBeenCalledWith('ABCDEF');
    });

    it('should show feedback after copying', async () => {
      const display = createRoomCodeDisplay('ABCDEF', { showCopy: true });

      const copyButton = display.querySelector('[data-testid="copy-code-btn"]');
      copyButton.click();

      // Wait for the async click handler to complete
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(0);

      // Check for feedback text
      expect(copyButton.textContent).toContain('Code copied!');
    });

    it('should call onShare callback when share button clicked', async () => {
      const onShare = vi.fn();
      const display = createRoomCodeDisplay('ABCDEF', {
        showShare: true,
        onShare,
      });

      const shareButton = display.querySelector('[data-testid="share-code-btn"]');
      shareButton.click();

      expect(onShare).toHaveBeenCalledWith('ABCDEF');
    });

    it('should use shareContent when no onShare callback provided', async () => {
      const { shareContent } = await import('../utils/share.js');
      const display = createRoomCodeDisplay('ABCDEF', { showShare: true });

      const shareButton = display.querySelector('[data-testid="share-code-btn"]');
      shareButton.click();

      expect(shareContent).toHaveBeenCalled();
    });

    it('should include label by default', () => {
      const display = createRoomCodeDisplay('ABCDEF');

      expect(display.textContent).toContain('Room Code');
    });

    it('should hide label when showLabel is false', () => {
      const display = createRoomCodeDisplay('ABCDEF', { showLabel: false });

      expect(display.textContent).not.toContain('Room Code');
    });
  });
});
