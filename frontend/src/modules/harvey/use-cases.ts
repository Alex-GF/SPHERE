import tableau2022 from './samples/tableau-2022.yaml?raw';

import type { PromptPreset } from './types/types';

export const USE_CASES: PromptPreset[] = [
  {
    id: 'tableau-best-configuration-given-requirements',
    label:
      'Best configuration of SaaS given price budget, feature requirements and usage limit restrictions',
    description:
      'Best configuration of Tableau given price budget, feature requirements and usage limit restrictions',
    question:
      'My company has a budget of $175 and needs create and publish new data sources with at least a usage limit of 1 flow. Which is the best configuration of Tableau that can offer this without exceeding the budget?',
    context: [
      {
        kind: 'yaml',
        label: 'Tableau (2022)',
        value: tableau2022,
        origin: 'preset',
      },
    ],
    response: {
      answer:
        'Here\u2019s the configuration that best meets your requirements without exceeding your $175 budget:\n\n---\n\n## Recommended configuration\n\n**Plan:** `CREATOR`  \n**Add\u2011on:** Tableau Data Management for Creator (in the YAML: `dataManagementCreator`)  \n**Total cost:** **75.5 $** per user/month  \n\nThis is comfortably under your 175 $ budget per month, leaving room for additional users if needed.\n\n---\n\n## Why this is the best (and effectively only) fit\n\n### 1. Ability to create and publish new data sources\n\nYour requirement:  \n> \u201cneeds create and publish new data sources\u201d\n\nIn the pricing file, that maps directly to the feature:\n\n- `createAndPublishNewDataSources`\n\nFrom the YAML:\n\n- The **`CREATOR`** plan is the only plan that includes  \n  `createAndPublishNewDataSources: true`.\n\nNeither `VIEWER` nor `EXPLORER` includes this capability, and no add\u2011on upgrades them to do so. So:\n\n- Any valid configuration **must** be based on the **CREATOR** plan.\n\n---\n\n### 2. At least 1 flow in usage limits\n\nYour requirement:  \n> \u201cwith at least a usage limit of 1 flow\u201d\n\nIn the YAML, this is modeled as:\n\n- `usageLimits.flowsLimit` \u2014  \n  *\u201cThe maximum number of flows that can be created and run by a user.\u201d*  \n  Default is 0 (no flows).\n\nBase `CREATOR` has `usageLimits: null`, so flowsLimit defaults to 0.  \nTo get flowsLimit \u2265 1, there are two relevant add\u2011ons:\n\n1. **Data Management for Creator (`dataManagementCreator`)**\n   - Price: 5.5 $\n   - Features it adds:\n     - `publishFlows: true`\n     - `runFlows: true`\n     - `scheduleFlows: true`\n     - `monitorFlowPerformance: true`\n     - `monitorFlowHealth: true`\n     - `viewLineageAndImpact: true`\n     - `setDataQualityWarnings: true`\n   - Usage limits:\n     - `flowsLimit: 1`\n\n2. **`resourceBlocks`** (also only for `CREATOR`)\n   - Price: 250 $ per block/month\n   - Only adds a `flowsLimit` extension of 1, and would put the total well **over** your 175 $ budget when combined with CREATOR.\n\nThus:\n\n- **`CREATOR` + Data Management for Creator** gives you  \n  `flowsLimit: 1` at **75.5 $** total per user/month.\n- **`CREATOR` + resourceBlocks** would cost **320 $** (70 + 250), which violates your budget.\n\nSo the cheapest way to achieve **flowsLimit \u2265 1** and stay under 175 $ is:\n\n> **`CREATOR` plan + Data Management for Creator add\u2011on = 75.5 $**\n\n---\n\n## Budget context\n\n- One **CREATOR + Data Management** user: **75.5 $**  \n- With a **175 $** budget, you could afford up to:\n  - **2 such users** (2 \u00d7 75.5 $ = 151 $) and still stay within budget.\n\nIf you tell me how many users need these capabilities, I can spell out the exact total and configuration per user.',
      plan: {
        actions: [
          {
            name: 'optimal',
            objective: 'minimize',
            solver: 'minizinc',
            pricing_url: 'uploaded://pricing',
            filters: {
              maxPrice: 175,
              features: ['createAndPublishNewDataSources'],
              usageLimits: [
                {
                  flowsLimit: 1,
                },
              ],
            },
          },
        ],
        requires_uploaded_yaml: false,
        use_pricing2yaml_spec: false,
      },
      result: {
        index: 0,
        action: 'optimal',
        payload: {
          request: {
            url: '',
            filters: {
              maxPrice: 175,
              features: ['createAndPublishNewDataSources'],
              usageLimits: [
                {
                  flowsLimit: 1,
                },
              ],
            },
            solver: 'minizinc',
            objective: 'minimize',
          },
          result: {
            optimal: {
              subscription: {
                plan: 'CREATOR',
                addOns: ['dataManagementViewer'],
                features: [
                  'webAccess',
                  'mobileAccess',
                  'embeddedContent',
                  'interactWithVisualizations',
                  'interactWithDashboards',
                  'createCustomViews',
                  'shareCustomViews',
                  'downloadVisualizationAsImages',
                  'downloadSummaryData',
                  'downloadFullData',
                  'seeDataQualityWarnings',
                  'commentOnDashboard',
                  'commentOnVisualization',
                  'createASubscriptionForYourself',
                  'receiveDataDrivenAlerts',
                  'createSubscriptionsForOthers',
                  'createDataDrivenAlerts',
                  'editExistingWorkbooks',
                  'editExistingVisualizations',
                  'createAndPublishNewWorkbookFromExistingDataSource',
                  'askData',
                  'createAndPublishNewWorkbookFromNewDataSources',
                  'createAndPublishNewDataSources',
                  'createNewWorkbooksBasedOnPreBuiltDashboardStarters',
                  'createNewDataFlows',
                  'editDataFlow',
                  'exportData',
                  'publishFlows',
                  'runFlows',
                  'scheduleFlows',
                  'monitorFlowPerformance',
                  'monitorFlowHealth',
                  'manageUserPermissions',
                  'manageContent',
                  'certifyDataSources',
                  'viewLineageAndImpact',
                  'setDataQualityWarnings',
                ],
                usageLimits: [
                  {
                    flowsLimit: 1,
                  },
                ],
              },
              cost: '75.5 $',
            },
          },
        },
        objective: 'minimize',
        filters: {
          maxPrice: 175,
          features: ['createAndPublishNewDataSources'],
          usageLimits: [
            {
              flowsLimit: 1,
            },
          ],
        },
        solver: 'minizinc',
        pricingContext: 'uploaded://pricing',
      },
    },
  },
];
