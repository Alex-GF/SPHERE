import overleaf2023 from './samples/overleaf-2023.yaml?raw';
import twoPlansEqual from './samples/two-plans-equal.yaml?raw';
import type { PromptPreset } from './types/types';

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'overleaf-optimal-plan',
    label: 'Find best value plan with GitHub integration',
    description: 'Find the most affordable Overleaf plan that includes GitHub integration and document history.',
    question:
      'Using the Overleaf pricing, what is the cheapest plan that bundles GitHub integration and the full document history? Compare it with the more expensive tiers.',
    context: [
      {
        kind: 'yaml',
        label: 'overleaf-2023.yaml',
        value: overleaf2023,
        origin: 'preset'
      }
    ]
  },
  {
    id: 'overleaf-seat-limits',
    label: 'Compare collaborator limits across plans',
    description: 'Summarise the collaborator capacity per Overleaf plan and highlight the maximum.',
    question:
      'From the Overleaf pricing file, list each plan with its collaborator limit and indicate which plan allows the highest number of collaborators.',
    context: [
      {
        kind: 'yaml',
        label: 'overleaf-2023.yaml',
        value: overleaf2023,
        origin: 'preset'
      }
    ]
  },
  {
    id: 'sample-plan-diagnostics',
    label: 'Analyze pricing for redundant plans',
    description: 'Inspect the sample pricing for redundant plans and suggest fixes.',
    question:
      'Inspect the provided sample pricing and explain whether the BASIC and PRO plans differ and how you would fix any issues in the YAML.',
    context: [
      {
        kind: 'yaml',
        label: 'two-plans-equal.yaml',
        value: twoPlansEqual,
        origin: 'preset'
      }
    ]
  }
];
