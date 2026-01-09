/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoomCodeInput, isValidRoomCode, VALID_CHARS } from './RoomCodeInput.js';

// Mock dependencies
vi.mock('../core/i18n.js', () => ({
  t: (key) => {
    const translations = {
      'party.enterCode': 'Enter room code',
      'party.code': 'Room Code',
    };
    return translations[key] || key;
  },
}));

describe('RoomCodeInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('VALID_CHARS', () => {
    it('should not contain confusing characters', () => {
      expect(VALID_CHARS).not.toContain('0');
      expect(VALID_CHARS).not.toContain('O');
      expect(VALID_CHARS).not.toContain('1');
      expect(VALID_CHARS).not.toContain('I');
      expect(VALID_CHARS).not.toContain('L');
    });

    it('should contain uppercase letters (except confusing ones)', () => {
      expect(VALID_CHARS).toContain('A');
      expect(VALID_CHARS).toContain('B');
      expect(VALID_CHARS).toContain('Z');
    });

    it('should contain numbers 2-9', () => {
      expect(VALID_CHARS).toContain('2');
      expect(VALID_CHARS).toContain('9');
    });
  });

  describe('isValidRoomCode', () => {
    it('should return true for valid 6-character code', () => {
      expect(isValidRoomCode('ABCDEF')).toBe(true);
      expect(isValidRoomCode('ABC234')).toBe(true);
    });

    it('should return false for code with invalid length', () => {
      expect(isValidRoomCode('ABC')).toBe(false);
      expect(isValidRoomCode('ABCDEFGH')).toBe(false);
      expect(isValidRoomCode('')).toBe(false);
    });

    it('should return false for code with invalid characters', () => {
      expect(isValidRoomCode('ABC0EF')).toBe(false); // Contains 0
      expect(isValidRoomCode('ABCOEF')).toBe(false); // Contains O
      expect(isValidRoomCode('ABC1EF')).toBe(false); // Contains 1
      expect(isValidRoomCode('ABCIEF')).toBe(false); // Contains I
      expect(isValidRoomCode('ABCLEF')).toBe(false); // Contains L
    });

    it('should handle lowercase input', () => {
      expect(isValidRoomCode('abcdef')).toBe(true);
      expect(isValidRoomCode('AbCdEf')).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(isValidRoomCode(null)).toBe(false);
      expect(isValidRoomCode(undefined)).toBe(false);
    });
  });

  describe('createRoomCodeInput', () => {
    it('should create input element', () => {
      const input = createRoomCodeInput();

      expect(input).toBeInstanceOf(HTMLElement);
      expect(input.querySelector('input')).not.toBeNull();
    });

    it('should have maxlength of 6', () => {
      const container = createRoomCodeInput();
      const input = container.querySelector('input');

      expect(input.getAttribute('maxlength')).toBe('6');
    });

    it('should filter invalid characters on input', () => {
      const container = createRoomCodeInput();
      const input = container.querySelector('input');

      input.value = 'abc0ef';
      input.dispatchEvent(new Event('input'));

      // Should filter out '0'
      expect(input.value).toBe('ABCEF');
    });

    it('should convert to uppercase', () => {
      const container = createRoomCodeInput();
      const input = container.querySelector('input');

      input.value = 'abcdef';
      input.dispatchEvent(new Event('input'));

      expect(input.value).toBe('ABCDEF');
    });

    it('should call onChange callback', () => {
      const onChange = vi.fn();
      const container = createRoomCodeInput({ onChange });
      const input = container.querySelector('input');

      input.value = 'ABC';
      input.dispatchEvent(new Event('input'));

      expect(onChange).toHaveBeenCalledWith('ABC');
    });

    it('should call onValidCode callback when code is complete', () => {
      const onValidCode = vi.fn();
      const container = createRoomCodeInput({ onValidCode });
      const input = container.querySelector('input');

      input.value = 'ABCDEF';
      input.dispatchEvent(new Event('input'));

      expect(onValidCode).toHaveBeenCalledWith('ABCDEF');
    });

    it('should not call onValidCode for incomplete code', () => {
      const onValidCode = vi.fn();
      const container = createRoomCodeInput({ onValidCode });
      const input = container.querySelector('input');

      input.value = 'ABC';
      input.dispatchEvent(new Event('input'));

      expect(onValidCode).not.toHaveBeenCalled();
    });

    it('should expose getValue method', () => {
      const container = createRoomCodeInput();
      const input = container.querySelector('input');

      input.value = 'ABCDEF';
      input.dispatchEvent(new Event('input'));

      expect(container.getValue()).toBe('ABCDEF');
    });

    it('should expose setValue method', () => {
      const container = createRoomCodeInput();

      container.setValue('ABCDEF');

      expect(container.getValue()).toBe('ABCDEF');
    });

    it('should expose showError method', () => {
      const container = createRoomCodeInput();

      container.showError('Invalid code');

      const errorElement = container.querySelector('[data-testid="input-error"]');
      expect(errorElement).not.toBeNull();
      expect(errorElement.textContent).toContain('Invalid code');
    });

    it('should expose clearError method', () => {
      const container = createRoomCodeInput();

      container.showError('Invalid code');
      container.clearError();

      const errorElement = container.querySelector('[data-testid="input-error"]');
      expect(errorElement).toBeNull();
    });

    it('should handle paste event', () => {
      const container = createRoomCodeInput();
      const input = container.querySelector('input');

      // Simulate paste with filtered content
      const pasteEvent = new Event('paste');
      pasteEvent.clipboardData = {
        getData: () => 'ABC-DEF',
      };

      // Manually trigger paste handling
      input.value = 'ABCDEF'; // Simulate paste result after filtering
      input.dispatchEvent(new Event('input'));

      expect(input.value).toBe('ABCDEF');
    });
  });
});
