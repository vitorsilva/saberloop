  import { describe, it, expect } from 'vitest';
  import { calculateVersion, formatDate } from './generate-version.js';

  describe('Version Generation', () => {

    describe('formatDate', () => {
      it('should format date as YYYYMMDD', () => {
        const date = new Date('2025-11-26T10:30:00');
        const result = formatDate(date);

        expect(result).toBe('20251126');
      });

      it('should pad single-digit month and day with zeros', () => {
        const date = new Date('2025-01-05T10:30:00');
        const result = formatDate(date);

        expect(result).toBe('20250105');
      });
    });

    describe('calculateVersion', () => {

      it('should create first version as YYYYMMDD.01', () => {
        const history = { lastDate: '', lastSeq: 0 };
        const currentDate = '20251126';

        const result = calculateVersion(history, currentDate);

        expect(result.version).toBe('20251126.01');
        expect(result.seq).toBe(1);
        expect(result.dateStr).toBe('20251126');
      });

      it('should increment sequence number continuously', () => {
        const history = { lastDate: '20251126', lastSeq: 1 };
        const currentDate = '20251126';

        const result = calculateVersion(history, currentDate);

        expect(result.version).toBe('20251126.02');
        expect(result.seq).toBe(2);
      });

      it('should continue incrementing on new day (not reset)', () => {
        const history = { lastDate: '20251125', lastSeq: 5 };
        const currentDate = '20251126';

        const result = calculateVersion(history, currentDate);

        expect(result.version).toBe('20251126.06');
        expect(result.seq).toBe(6);
      });

      it('should handle double-digit sequence numbers', () => {
        const history = { lastDate: '20251126', lastSeq: 14 };
        const currentDate = '20251126';

        const result = calculateVersion(history, currentDate);

        expect(result.version).toBe('20251126.15');
        expect(result.seq).toBe(15);
      });

      it('should pad single-digit sequence with leading zero', () => {
        const history = { lastDate: '20251126', lastSeq: 4 };
        const currentDate = '20251126';

        const result = calculateVersion(history, currentDate);

        expect(result.version).toBe('20251126.05');
        expect(result.seq).toBe(5);
      });

      it('should handle large sequence numbers', () => {
        const history = { lastDate: '20251125', lastSeq: 99 };
        const currentDate = '20251126';

        const result = calculateVersion(history, currentDate);

        expect(result.version).toBe('20251126.100');
        expect(result.seq).toBe(100);
      });
    });

  });