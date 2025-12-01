/**
 * Game Systems Index
 * 
 * All game systems following the Hybrid ECS architecture.
 * Each system extends the base System class and implements
 * the Template Method pattern for consistent lifecycle.
 */

// Campaign Phase
export { CampaignSystem, campaignSystem, ACTION_CONFIGS } from './campaign';
export type { ActionConfig } from './campaign';

// Election Phase
export { ElectionSystem, electionSystem, ELECTORAL_THRESHOLD, TOTAL_PARLIAMENT_SEATS } from './election';

// Coalition Formation Phase
export { CoalitionSystem, coalitionSystem, MAJORITY_THRESHOLD } from './coalition';

// Governing Phase
export { GoverningSystem, governingSystem } from './governing';
