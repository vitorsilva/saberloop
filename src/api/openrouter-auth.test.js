  import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
  import {
    generateCodeVerifier,
    generateCodeChallenge,
    isAuthCallback
  } from './openrouter-auth.js';

  describe('OpenRouter Auth', () => {

    describe('generateCodeVerifier', () => {
      it('should return a string', () => {
        const verifier = generateCodeVerifier();
        expect(typeof verifier).toBe('string');
      });

      it('should be 43 characters long', () => {
        // 32 bytes → base64 = 44 chars, minus 1 padding = 43
        const verifier = generateCodeVerifier();
        expect(verifier.length).toBe(43);
      });

      it('should only contain URL-safe characters', () => {
        const verifier = generateCodeVerifier();
        // URL-safe base64: a-z, A-Z, 0-9, -, _
        const urlSafePattern = /^[A-Za-z0-9_-]+$/;
        expect(verifier).toMatch(urlSafePattern);
      });

      it('should generate different values each time', () => {
        const verifier1 = generateCodeVerifier();
        const verifier2 = generateCodeVerifier();
        expect(verifier1).not.toBe(verifier2);
      });
    });

    describe('generateCodeChallenge', () => {
      it('should return a string', async () => {
        const verifier = 'test-verifier-string-for-testing';
        const challenge = await generateCodeChallenge(verifier);
        expect(typeof challenge).toBe('string');
      });

      it('should be 43 characters long', async () => {
        // SHA-256 = 32 bytes → base64 = 43 chars without padding
        const verifier = 'test-verifier-string-for-testing';
        const challenge = await generateCodeChallenge(verifier);
        expect(challenge.length).toBe(43);
      });

      it('should only contain URL-safe characters', async () => {
        const verifier = 'test-verifier-string-for-testing';
        const challenge = await generateCodeChallenge(verifier);
        const urlSafePattern = /^[A-Za-z0-9_-]+$/;
        expect(challenge).toMatch(urlSafePattern);
      });

      it('should produce consistent output for same input', async () => {
        const verifier = 'consistent-test-verifier';
        const challenge1 = await generateCodeChallenge(verifier);
        const challenge2 = await generateCodeChallenge(verifier);
        expect(challenge1).toBe(challenge2);
      });

      it('should produce different output for different input', async () => {
        const challenge1 = await generateCodeChallenge('verifier-one');
        const challenge2 = await generateCodeChallenge('verifier-two');
        expect(challenge1).not.toBe(challenge2);
      });
    });

    describe('isAuthCallback', () => {
      const originalLocation = window.location;

      beforeEach(() => {
        // Mock window.location
        delete window.location;
      });

      afterEach(() => {
        // Restore window.location
        window.location = originalLocation;
      });

      it('should return true when URL has code parameter', () => {
        window.location = { search: '?code=abc123' };
        expect(isAuthCallback()).toBe(true);
      });

      it('should return false when URL has no code parameter', () => {
        window.location = { search: '' };
        expect(isAuthCallback()).toBe(false);
      });

      it('should return false when URL has other parameters but no code', () => {
        window.location = { search: '?state=xyz&redirect=home' };
        expect(isAuthCallback()).toBe(false);
      });

      it('should return true when code is among multiple parameters', () => {
        window.location = { search: '?state=xyz&code=abc123&other=value' };
        expect(isAuthCallback()).toBe(true);
      });
    });

  });