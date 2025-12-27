import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateShareImage, getShareImageDimensions } from './share-image.js';

// Mock canvas context
const createMockContext = () => ({
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  fillStyle: '',
  font: '',
  textAlign: '',
  textBaseline: ''
});

describe('Share Image Generator', () => {
  let originalCreateElement;
  let mockCanvas;
  let mockContext;
  let mockBlob;

  beforeEach(() => {
    originalCreateElement = document.createElement;
    mockContext = createMockContext();
    mockBlob = new Blob(['test'], { type: 'image/png' });

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
      toBlob: vi.fn((callback) => callback(mockBlob))
    };

    document.createElement = vi.fn((tag) => {
      if (tag === 'canvas') {
        return mockCanvas;
      }
      return originalCreateElement.call(document, tag);
    });
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
    vi.restoreAllMocks();
  });

  describe('generateShareImage', () => {
    it('should create canvas with correct dimensions', async () => {
      await generateShareImage({
        topic: 'History',
        score: 4,
        total: 5,
        percentage: 80
      });

      expect(mockCanvas.width).toBe(600);
      expect(mockCanvas.height).toBe(400);
    });

    it('should get 2D context from canvas', async () => {
      await generateShareImage({
        topic: 'History',
        score: 4,
        total: 5,
        percentage: 80
      });

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });

    it('should create background gradient', async () => {
      await generateShareImage({
        topic: 'History',
        score: 4,
        total: 5,
        percentage: 80
      });

      expect(mockContext.createLinearGradient).toHaveBeenCalledWith(0, 0, 600, 400);
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 600, 400);
    });

    it('should draw topic text', async () => {
      await generateShareImage({
        topic: 'History',
        score: 4,
        total: 5,
        percentage: 80
      });

      expect(mockContext.fillText).toHaveBeenCalledWith(
        'History Quiz Master!',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should draw score', async () => {
      await generateShareImage({
        topic: 'History',
        score: 4,
        total: 5,
        percentage: 80
      });

      expect(mockContext.fillText).toHaveBeenCalledWith(
        '4/5',
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockContext.fillText).toHaveBeenCalledWith(
        '80%',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should draw challenge text', async () => {
      await generateShareImage({
        topic: 'History',
        score: 4,
        total: 5,
        percentage: 80
      });

      expect(mockContext.fillText).toHaveBeenCalledWith(
        'Can you beat my score?',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should draw SABERLOOP badge', async () => {
      await generateShareImage({
        topic: 'History',
        score: 4,
        total: 5,
        percentage: 80
      });

      expect(mockContext.fillText).toHaveBeenCalledWith(
        'SABERLOOP',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should truncate long topic names', async () => {
      await generateShareImage({
        topic: 'This is a very long topic name that should be truncated',
        score: 4,
        total: 5,
        percentage: 80
      });

      // Should call fillText with truncated topic
      const fillTextCalls = mockContext.fillText.mock.calls;
      const topicCall = fillTextCalls.find(call =>
        call[0].includes('Quiz Master') && call[0].includes('...')
      );
      expect(topicCall).toBeDefined();
    });

    it('should return PNG blob', async () => {
      const result = await generateShareImage({
        topic: 'History',
        score: 4,
        total: 5,
        percentage: 80
      });

      expect(result).toBe(mockBlob);
      expect(mockCanvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/png'
      );
    });

    it('should throw error when canvas context not available', async () => {
      mockCanvas.getContext = vi.fn(() => null);

      await expect(generateShareImage({
        topic: 'History',
        score: 4,
        total: 5,
        percentage: 80
      })).rejects.toThrow('Canvas not supported');
    });

    it('should reject when toBlob returns null', async () => {
      mockCanvas.toBlob = vi.fn((callback) => callback(null));

      await expect(generateShareImage({
        topic: 'History',
        score: 4,
        total: 5,
        percentage: 80
      })).rejects.toThrow('Failed to create image blob');
    });
  });

  describe('getShareImageDimensions', () => {
    it('should return correct dimensions', () => {
      const dimensions = getShareImageDimensions();

      expect(dimensions).toEqual({
        width: 600,
        height: 400
      });
    });
  });
});
