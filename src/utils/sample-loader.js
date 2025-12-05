  import { getSetting, saveSetting, saveSession, deleteSampleSessions } from
  '../db/db.js';
  import sampleData from '../data/sample-quizzes.json';

  const SAMPLES_VERSION_KEY = 'samplesVersion';

  /**
   * Load sample quizzes into IndexedDB if not already loaded
   * or if the samples version has changed.
   */
  export async function loadSamplesIfNeeded() {
    const storedVersion = await getSetting(SAMPLES_VERSION_KEY);
    const currentVersion = sampleData.version;

    if (storedVersion === currentVersion) {
      console.log('[Samples] Already loaded, version:', storedVersion);
      return;
    }

    console.log('[Samples] Loading samples, version:', currentVersion);

    // Clear old samples before loading new ones
    await deleteSampleSessions();

    // Load each sample quiz into the sessions store
    for (const sample of sampleData.samples) {
      const session = {
        topic: sample.topic,
        gradeLevel: sample.gradeLevel,
        totalQuestions: sample.totalQuestions,
        questions: sample.questions,
        isSample: true,
        answers: null,
        score: null,
        timestamp: 0
      };

      try {
        await saveSession(session);
        console.log('[Samples] Loaded:', sample.topic);
      } catch (error) {
        console.error('[Samples] Failed to load:', sample.topic, error);
      }
    }

    await saveSetting(SAMPLES_VERSION_KEY, currentVersion);
    console.log('[Samples] All samples loaded successfully');
  }