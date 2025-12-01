import { describe, it, expect } from 'vitest';
import { electionSystem, TOTAL_PARLIAMENT_SEATS } from './election';

describe('ElectionSystem', () => {
    it('should export correct constants', () => {
        expect(TOTAL_PARLIAMENT_SEATS).toBe(150);
    });

    it('should be defined', () => {
        expect(electionSystem).toBeDefined();
    });

    // Add more tests as needed, e.g. mocking state and running process
});
