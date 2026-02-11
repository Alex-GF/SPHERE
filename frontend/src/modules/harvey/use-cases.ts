import tableau2022 from './samples/tableau-2022.yaml?raw';
import clickup2022 from './samples/clickup-2022.yaml?raw';
import trello2022 from './samples/trello-2022.yaml?raw';
import github2024 from './samples/github-2024.yaml?raw';
import circleci2024 from './samples/circleci-2024.yaml?raw';

import type { PromptPreset } from './types/types';

export const UseCases = {
  AMINT: 'a-mint-extraction',
} as const;

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
  {
    id: 'cheapest-subscription-given-an-action',
    label: 'Given that an user wants to achieve X. Determine the cheaper subscription between SaaS',
    description:
      'Given that an user wants to achieve X. Determine the cheaper subscription between SaaS',
    question:
      'I need to perform priority support for issues. Compare the prices of ClickUp and Trello to determine which is cheaper for this specific use.',
    context: [
      {
        kind: 'yaml',
        label: 'ClickUp (2022)',
        value: clickup2022,
      },
      {
        kind: 'yaml',
        label: 'Trello (2022)',
        value: trello2022,
      },
    ],
    response: {
      answer:
        'Here\u2019s the direct comparison focused strictly on getting **priority support** from each vendor.\n\n### ClickUp\n\n- **Cheapest plan that includes `prioritySupport`:** `BUSINESS_PLUS`\n- **Price:** `29` USD per member/month  \n- **Why this plan:**  \n  - In the ClickUp pricing YAML, `prioritySupport` is only enabled on:\n    - `BUSINESS_PLUS` (price: 29, unit: member/month)\n    - `ENTERPRISE` (price: Contact Sales \u2013 not a fixed numeric price)\n  - I asked the optimizer to **minimize price subject to `prioritySupport = true`**, and it chose `BUSINESS_PLUS` at **29 $**.\n- **What \u201cpriority support\u201d means in ClickUp\u2019s own words:**  \n  > \u201cReceive an enhanced level of support to quickly resolve your highest priority issues.\u201d\n\n### Trello\n\n- **Cheapest plan that includes `prioritySupport`:** `PREMIUM`\n- **Price:** `10` USD per user/month  \n- **Why this plan:**  \n  - In the Trello YAML, `prioritySupport` is enabled on:\n    - `PREMIUM` (price: 10, unit: user/month)\n    - `ENTERPRISE` (price: 17.50, unit: user/month)\n  - With the same optimization\u2014**minimize price with `prioritySupport = true`**\u2014the tool selected `PREMIUM` at **10 $**, with no add-ons required.\n- **What \u201cpriority support\u201d means for Trello:**  \n  > \u201cCustomers with Premium or Enterprise get priority email support, meaning we\u2019ll make sure your questions get answered within one business day.\u201d\n\n*(Context note: Trello also has an annual discount factor `annual: 0.883`, so Premium would be about 8.83 USD/user/month if billed annually, but the optimizer\u2019s result is based on the listed monthly price of 10 $.)*\n\n---\n\n### Which is cheaper for priority support?\n\nFor the specific need of having **priority support on your issues** with each tool:\n\n- **ClickUp:** BUSINESS_PLUS at **29 $/member/month**\n- **Trello:** PREMIUM at **10 $/user/month**\n\n**Trello is the cheaper option** for obtaining priority support, by **19 $ per user per month** compared to the lowest ClickUp plan that includes priority support.',
      plan: {
        actions: [
          {
            name: 'optimal',
            objective: 'minimize',
            solver: 'minizinc',
            pricing_url: 'uploaded://pricing/1',
            filters: {
              features: ['prioritySupport'],
            },
          },
          {
            name: 'optimal',
            objective: 'minimize',
            solver: 'minizinc',
            pricing_url: 'uploaded://pricing/2',
            filters: {
              features: ['prioritySupport'],
            },
          },
        ],
        requires_uploaded_yaml: false,
        use_pricing2yaml_spec: false,
      },
      result: {
        actions: ['optimal', 'optimal'],
        steps: [
          {
            index: 0,
            action: 'optimal',
            payload: {
              request: {
                url: '',
                filters: {
                  features: ['prioritySupport'],
                },
                solver: 'minizinc',
                objective: 'minimize',
              },
              result: {
                optimal: {
                  subscription: {
                    plan: 'BUSINESS_PLUS',
                    addOns: [],
                    features: [
                      'tasks',
                      'spaces',
                      'listsPerFolder',
                      'foldersPerSpace',
                      'customViews',
                      'fileStorage',
                      'privacy',
                      'sharing',
                      'guests',
                      'guestsPermissions',
                      'customFields',
                      'templateEverything',
                      'list',
                      'board',
                      'calendar',
                      'box',
                      'gantt',
                      'activity',
                      'timeline',
                      'workload',
                      'workloadCustomCapacityAndAdditionalGroups',
                      'table',
                      'map',
                      'mindMaps',
                      'whiteboards',
                      'doc',
                      'chat',
                      'form',
                      'formBrandingAndCustomization',
                      'embed',
                      'customStatuses',
                      'customTasksIDs',
                      'superRichEditing',
                      'automations',
                      'multipleActionsInAutomations',
                      'portfolios',
                      'portfoliosPermissions',
                      'portfoliosSharing',
                      'futureRecurringTasksOnCalendar',
                      'multipleAssignees',
                      'multitaskToolbar',
                      'taskChecklists',
                      'dependencies',
                      'relationships',
                      'tags',
                      'priorities',
                      'columnCalculations',
                      'apiCalls',
                      'docTags',
                      'proofing',
                      'publiclyShare',
                      'inAppVideoRecording',
                      'emailInClickUp',
                      'teams',
                      'teamSharing',
                      'guestVisibility',
                      'naturalLanguageProcessing',
                      'smartNotifications',
                      'assignComments',
                      'delegateReminders',
                      'privateDocs',
                      'cloudStorage',
                      'tasksInMultipleLists',
                      'subtasksInMultipleLists',
                      'goals',
                      'goalFolders',
                      'dashboards',
                      'dashboardsWidget',
                      'timeTracking',
                      'granularTimeEstimates',
                      'timeInStatus',
                      'sprints',
                      'sprintPoints',
                      'pulseLiveOverview',
                      'pulseLiveOverviewHistoricalData',
                      'milestones',
                      'homeAndScheduling',
                      'workloadProfiles',
                      'everything',
                      'workInProgressLimits',
                      'customExporting',
                      'criticalPathAndSlackTime',
                      'timeTrackingWidgets',
                      'timeTrackingWidgetsBillableReportsAndTimesheets',
                      'nativeIntegrations',
                      'timeTrackingNotesLabelsAndBillableTime',
                      'timeSheets',
                      'zapier',
                      'make',
                      'googleDrive',
                      'dropbox',
                      'boxCloudStorage',
                      'oneDriveCloudStorage',
                      'twoFactorAuthentication',
                      'smsTwoFactorAuthentication',
                      'requireTwoFactorAuthentication',
                      'googleSSO',
                      'hipaaCompliance',
                      'contractAndLegalReview',
                      'customPermissions',
                      'customRoles',
                      'restrictWhoCanAddGuests',
                      'anytimeSupport',
                      'liveChatSupport',
                      'prioritySupport',
                      'adminTrainingWebinar',
                    ],
                    usageLimits: [
                      {
                        useUsers: 1000000,
                      },
                      {
                        useTasks: 100000000,
                      },
                      {
                        useSpaces: 1000000,
                      },
                      {
                        useListsPerFolder: 400,
                      },
                      {
                        useFoldersPerSpace: 400,
                      },
                      {
                        useCustomViews: 100000000,
                      },
                      {
                        useFileStorage: 100000000,
                      },
                      {
                        useGuests: 1000000,
                      },
                      {
                        useGuestsPermissions: 10,
                      },
                      {
                        useCustomFields: 100000000,
                      },
                      {
                        useGantt: 100000000,
                      },
                      {
                        useActivity: 100000000,
                      },
                      {
                        useTimeline: 100000000,
                      },
                      {
                        useWorkload: 100000000,
                      },
                      {
                        useMap: 100000000,
                      },
                      {
                        useMindMaps: 100000000,
                      },
                      {
                        useWhiteboards: 100000000,
                      },
                      {
                        useChat: 100000000,
                      },
                      {
                        useAutomations: 25000,
                      },
                      {
                        usePortfolios: 100,
                      },
                      {
                        useApiCalls: 1000,
                      },
                      {
                        useDocTags: 100000000,
                      },
                      {
                        useEmailInClickUp: 100000000,
                      },
                      {
                        useEmailAccountsInClickUp: 2,
                      },
                      {
                        useTeams: 100000000,
                      },
                      {
                        useTasksInMultipleLists: 100000000,
                      },
                      {
                        useSubtasksInMultipleLists: 100000000,
                      },
                      {
                        useGoals: 100,
                      },
                      {
                        useDashboards: 100000000,
                      },
                      {
                        useSprintPoints: 100000000,
                      },
                      {
                        usePulseLiveOverview: 100000000,
                      },
                      {
                        useMilestones: 100000000,
                      },
                      {
                        useCustomExporting: 100000000,
                      },
                      {
                        useCriticalPathAndSlackTime: 100000000,
                      },
                      {
                        useCustomRoles: 1,
                      },
                    ],
                  },
                  cost: '29 $',
                },
              },
            },
            objective: 'minimize',
            filters: {
              features: ['prioritySupport'],
            },
            solver: 'minizinc',
            pricingContext: 'uploaded://pricing/1',
          },
          {
            index: 1,
            action: 'optimal',
            payload: {
              request: {
                url: '',
                filters: {
                  features: ['prioritySupport'],
                },
                solver: 'minizinc',
                objective: 'minimize',
              },
              result: {
                optimal: {
                  subscription: {
                    plan: 'PREMIUM',
                    addOns: [],
                    features: [
                      'cards',
                      'builtinAutomation',
                      'assigneeDates',
                      'dueDates',
                      'iosApp',
                      'androidApp',
                      'desktopApp',
                      'activityLogs',
                      'trelloTemplates',
                      '2factorAuthentication',
                      'mobileDeviceManagement',
                      'powerUps',
                      'boards',
                      'advancedChecklists',
                      'customFields',
                      'dashboardView',
                      'timelineView',
                      'tableView',
                      'calendarView',
                      'mapView',
                      'workspaceTableView',
                      'workspaceCalendarView',
                      'workspaceLevelTemplates',
                      'commandRunAdministration',
                      'boardCollections',
                      'prioritySupport',
                      'observers',
                      'domainRestrictedInvites',
                      'deactivateMembers',
                      'simpleDataExport',
                      'workspaces',
                    ],
                    usageLimits: [
                      {
                        boardsLimit: 100000000,
                      },
                      {
                        powerUpsLimit: 100000000,
                      },
                      {
                        workspacesLimit: 1,
                      },
                    ],
                  },
                  cost: '10 $',
                },
              },
            },
            objective: 'minimize',
            filters: {
              features: ['prioritySupport'],
            },
            solver: 'minizinc',
            pricingContext: 'uploaded://pricing/2',
          },
        ],
        lastPayload: {
          request: {
            url: '',
            filters: {
              features: ['prioritySupport'],
            },
            solver: 'minizinc',
            objective: 'minimize',
          },
          result: {
            optimal: {
              subscription: {
                plan: 'PREMIUM',
                addOns: [],
                features: [
                  'cards',
                  'builtinAutomation',
                  'assigneeDates',
                  'dueDates',
                  'iosApp',
                  'androidApp',
                  'desktopApp',
                  'activityLogs',
                  'trelloTemplates',
                  '2factorAuthentication',
                  'mobileDeviceManagement',
                  'powerUps',
                  'boards',
                  'advancedChecklists',
                  'customFields',
                  'dashboardView',
                  'timelineView',
                  'tableView',
                  'calendarView',
                  'mapView',
                  'workspaceTableView',
                  'workspaceCalendarView',
                  'workspaceLevelTemplates',
                  'commandRunAdministration',
                  'boardCollections',
                  'prioritySupport',
                  'observers',
                  'domainRestrictedInvites',
                  'deactivateMembers',
                  'simpleDataExport',
                  'workspaces',
                ],
                usageLimits: [
                  {
                    boardsLimit: 100000000,
                  },
                  {
                    powerUpsLimit: 100000000,
                  },
                  {
                    workspacesLimit: 1,
                  },
                ],
              },
              cost: '10 $',
            },
          },
        },
      },
    },
  },
  {
    id: 'what-is-the-best-configuration-to-perform-action',
    label: 'What is the best configuration to perform an action',
    description: 'What is the best configuration to perform an action',
    question:
      'What is the best configuration among all these SaaS products for continous integration?',
    context: [
      {
        kind: 'yaml',
        label: 'Github (2024)',
        value: github2024,
      },
      {
        kind: 'yaml',
        label: 'CircleCI (2024)',
        value: circleci2024,
      },
    ],
    response: {
      answer:
        "Here is the best configuration for continuous integration across the given SaaS products, based on the plan you executed and the pricing context provided.\n\nWhat the tools showed (summary)\n\n- For GitHub Actions (pricing context from pricing/1):\n  - Optimal subscription: FREE\n  - Cost: 0 € (per tool output)\n  - Key quota/details: includes githubActions with a quota of 2000 minutes; repository features like publicRepositories, privateRepositories, etc., are included in the FREE tier\n  - Plan name exactly: FREE\n\n- For CircleCI - Cloud (pricing context from pricing/2):\n  - Optimal subscription: FREE\n  - Cost: 0 $ (per tool output)\n  - Key quotas/details: includes concurrentJobRuns (30 non-Mac OS and 1 Mac OS), selfHostedRunners (limit 5), and other basic CI features on the FREE tier\n\nHow to interpret this\n- Both options can be used at no cost on their respective FREE plans.\n- GitHub Actions on GitHub's FREE plan covers CI directly in the repository's ecosystem (minutes quota applies, with 2000 minutes stated in the tool output; public repos have free use in practice, per the YAML context).\n- CircleCI's FREE plan provides concurrency for CI jobs (30 non-Mac non-MMOS concurrency, 1 Mac OS), plus other CI-related capabilities.\n\nBest configuration (practical recommendation)\n- Primary CI workflow:\n  - Use GitHub Actions on GitHub's FREE plan as your main continuous integration engine if your code is hosted on GitHub. This leverages deep integration, simplicity, and zero cost for basic CI workloads.\n  - Rationale: The tool results show the GitHub Actions path is available at 0 cost and includes the core CI features you likely need (githubActions minute quota and repository workflow features) in the FREE tier.\n- Optional concurrency augmentation (only if you need more parallelism or OS-specific runners beyond GitHub Actions' capabilities):\n  - Optionally pair with CircleCI Cloud FREE plan for additional concurrent runs (30 non-Mac, 1 Mac) at 0 cost.\n  - Rationale: This is also a FREE path and can supplement concurrent needs if your CI demands exceed what GitHub Actions can accommodate within its free usage pattern.\n\nNotes and context from Pricing Context\n- GitHub Actions: The Pricing YAML describes Actions as minutes-based, with a quota (2000 minutes in the tool's data) and free usage for public repositories; the FREE plan includes a broad set of repository features beyond Actions.\n- CircleCI: The FREE plan explicitly provides concurrentJobRuns (30 non-Mac, 1 Mac) and self-hosted runners (limit 5), among other standard CI features.\n\nBottom line\n- Best cost-minimizing configuration:\n  - Primary: GitHub Actions on GitHub FREE (0 €) for CI on GitHub-hosted repos.\n  - Optional: CircleCI Cloud FREE (0 $) if you need extra concurrency beyond GitHub Actions' capabilities (up to 30 non-Mac and 1 Mac concurrently).\n\nWhy this is chosen\n- The optimization results show zero-cost options for both features/paths:\n  - GitHub Actions path: FREE plan, 0 cost, with the required Actions capability.\n  - CircleCI path: FREE plan, 0 cost, with the needed concurrentJobRuns capability.\n- Since there isn't a single product in the provided results that combines both features under one plan at zero cost, the cheapest practical approach is to use the FREE plans of the two platforms as a combination, with GitHub Actions as the primary CI engine for GitHub-hosted projects and CircleCI as a potential concurrency supplement if needed.\n\nIf you want, I can map this to a concrete setup plan (which repos/workflows to put on Actions vs CircleCI, how to split test jobs, and recommended runner configurations).",
      plan: {
        actions: [
          {
            name: 'optimal',
            objective: 'minimize',
            pricing_url: 'uploaded://pricing/1',
            filters: {
              features: ['githubActions'],
            },
            solver: 'minizinc',
          },
          {
            name: 'optimal',
            objective: 'minimize',
            pricing_url: 'uploaded://pricing/2',
            filters: {
              features: ['concurrentJobRuns'],
            },
            solver: 'minizinc',
          },
        ],
        requires_uploaded_yaml: false,
        use_pricing2yaml_spec: false,
      },
      result: {
        actions: ['optimal', 'optimal'],
        steps: [
          {
            index: 0,
            action: 'optimal',
            payload: {
              request: {
                url: '',
                filters: {
                  features: ['githubActions'],
                },
                solver: 'minizinc',
                objective: 'minimize',
              },
              result: {
                optimal: {
                  subscription: {
                    plan: 'FREE',
                    addOns: [],
                    features: [
                      'publicRepositories',
                      'privateRepositories',
                      'githubCodespaces',
                      'githubActions',
                      'githubPackages',
                      'codeReviews',
                      'pullRequests',
                      'protectedBranches',
                      'codeOwners',
                      'draftPullRequests',
                      'multiplePullRequestsAssignees',
                      'repositoryInsights',
                      'scheduledReminders',
                      'automaticCodeReviewAssigment',
                      'enviromentProtectionRules',
                      'enviromentDeploymentBranchesAndSecrets',
                      'collaboratorsForPublicRepositories',
                      'collaboratorsForPrivateRepositories',
                      'issues',
                      'projects',
                      'milestones',
                      'teamDiscussions',
                      'organizationAndTeamManagement',
                      'pagesAndWikis',
                      'multipleIssueAssignees',
                      'codeScanning',
                      'secretScanning',
                      'dependencyReview',
                      'dependabotAlerts',
                      'dependabotSecurityUpdates',
                      'dependabotVersionUpdates',
                      'requiredReviews',
                      'requiredStatusChecks',
                      'githubSecurityAdvisories',
                      'roleBasedAccessControl',
                      'required2FA',
                      'auditLog',
                      'githubApps',
                      'statusChecks',
                      'communitySupport',
                      'invoiceBilling',
                      'gitLFS',
                    ],
                    usageLimits: [
                      {
                        githubOnlyForPublicRepositoriesFreeTier: 1,
                      },
                      {
                        githubOnlyForPublicRepositoriesTeamTier: 1,
                      },
                      {
                        githubActionsQuota: 2000,
                      },
                      {
                        diskSpaceForGithubPackages: 0.5,
                      },
                      {
                        githubCodepacesStorage: 15,
                      },
                      {
                        githubCodepacesCoreHours: 120,
                      },
                      {
                        gitLFSMaximunFileSize: 2,
                      },
                      {
                        gitLFSStorageLimit: 1,
                      },
                      {
                        gitLFSBandwithLimit: 1,
                      },
                    ],
                  },
                  cost: '0 €',
                },
              },
            },
            objective: 'minimize',
            filters: {
              features: ['githubActions'],
            },
            solver: 'minizinc',
            pricingContext: 'uploaded://pricing/1',
          },
          {
            index: 1,
            action: 'optimal',
            payload: {
              request: {
                url: '',
                filters: {
                  features: ['concurrentJobRuns'],
                },
                solver: 'minizinc',
                objective: 'minimize',
              },
              result: {
                optimal: {
                  subscription: {
                    plan: 'FREE',
                    addOns: [],
                    features: [
                      'network',
                      'storage',
                      'smallX86DockerVM',
                      'mediumX86DockerVM',
                      'mediumX86PlusDockerVM',
                      'largeX86DockerVM',
                      'mediumArmDockerVM',
                      'largeArmDockerVM',
                      'mediumLinuxVM',
                      'largeLinuxVM',
                      'mediumArmVM',
                      'largeArmVM',
                      'xlargeArmVM',
                      '2xlargeArmVM',
                      'mediumWindowsVM',
                      'largeWindowsVM',
                      'm1MediumMacOsVM',
                      'concurrentJobRuns',
                      'selfHostedRunners',
                      'dockerLayerCatching',
                      'flakyTestDetection',
                      'privateOrbs',
                      'components',
                      'componentsRelease',
                      'communitySupport',
                    ],
                    usageLimits: [
                      {
                        maxUsers: 5,
                      },
                      {
                        creditsLimit: 30000,
                      },
                      {
                        networkLimit: 1,
                      },
                      {
                        storageLimit: 2,
                      },
                      {
                        concurrentJobRunsLimitNonMacOs: 30,
                      },
                      {
                        concurrentJobRunsLimitMacOs: 1,
                      },
                      {
                        selfHostedRunnersLimit: 5,
                      },
                      {
                        flakyTestDetectionLimit: 5,
                      },
                      {
                        componentsLimit: 3,
                      },
                    ],
                  },
                  cost: '0 $',
                },
              },
            },
            objective: 'minimize',
            filters: {
              features: ['concurrentJobRuns'],
            },
            solver: 'minizinc',
            pricingContext: 'uploaded://pricing/2',
          },
        ],
        lastPayload: {
          request: {
            url: '',
            filters: {
              features: ['concurrentJobRuns'],
            },
            solver: 'minizinc',
            objective: 'minimize',
          },
          result: {
            optimal: {
              subscription: {
                plan: 'FREE',
                addOns: [],
                features: [
                  'network',
                  'storage',
                  'smallX86DockerVM',
                  'mediumX86DockerVM',
                  'mediumX86PlusDockerVM',
                  'largeX86DockerVM',
                  'mediumArmDockerVM',
                  'largeArmDockerVM',
                  'mediumLinuxVM',
                  'largeLinuxVM',
                  'mediumArmVM',
                  'largeArmVM',
                  'xlargeArmVM',
                  '2xlargeArmVM',
                  'mediumWindowsVM',
                  'largeWindowsVM',
                  'm1MediumMacOsVM',
                  'concurrentJobRuns',
                  'selfHostedRunners',
                  'dockerLayerCatching',
                  'flakyTestDetection',
                  'privateOrbs',
                  'components',
                  'componentsRelease',
                  'communitySupport',
                ],
                usageLimits: [
                  {
                    maxUsers: 5,
                  },
                  {
                    creditsLimit: 30000,
                  },
                  {
                    networkLimit: 1,
                  },
                  {
                    storageLimit: 2,
                  },
                  {
                    concurrentJobRunsLimitNonMacOs: 30,
                  },
                  {
                    concurrentJobRunsLimitMacOs: 1,
                  },
                  {
                    selfHostedRunnersLimit: 5,
                  },
                  {
                    flakyTestDetectionLimit: 5,
                  },
                  {
                    componentsLimit: 3,
                  },
                ],
              },
              cost: '0 $',
            },
          },
        },
      },
    },
  },
  {
    id: UseCases.AMINT,
    label: 'A-MINT iPricing extraction',
    description: 'Extract an iPricing from the URL provided by the user',
    question: 'Extract an iPricing from the URL passed in the context',
    context: [
      {
        kind: 'url',
        label: 'https://proton.me/mail/pricing',
        value: 'https://proton.me/mail/pricing',
      },
    ],
    response: {
      answer: 'Based on the executed iPricing analysis and the authoritative Pricing2Yaml specification for Proton Mail here is the consolidated, precise, and contextualized answer.',
      plan: {
        actions: ['iPricing'],
        requires_uploaded_yaml: false,
        use_pricing2yaml_spec: false,
      },
      result: {
        syntaxVersion: '3.0',
        saasName: 'Proton Mail',
        createdAt: '2026-02-11T00:00:00.000Z',
        version: '2026-02-11',
        currency: 'EUR',
        url: 'https://web.archive.org/web/20260211182642/https://proton.me/mail/pricing',
        tags: [
          'Proton Mail',
          'Proton Calendar',
          'Proton Drive',
          'Proton VPN',
          'Proton Pass',
          'Proton Wallet',
        ],
        features: {
          storage: {
            valueType: 'BOOLEAN',
            defaultValue: true,
            type: 'DOMAIN',
          },
          priorityCustomerSupport: {
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'SUPPORT',
          },
          easySwitchImportAssistant: {
            description: 'Quickly transfer your emails, calendars or contacts from any provider.',
            valueType: 'BOOLEAN',
            defaultValue: true,
            type: 'INTEGRATION',
            integrationType: 'WEB_SAAS',
            pricingUrls: ['https://mail.google.com'],
          },
          protonSentinelProgram: {
            description:
              'Provides the highest level of account security protection and specialist support.',
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'SUPPORT',
          },
          emergencyAccess: {
            description:
              'Grant permission to trusted contacts to securely access your Proton account in an emergency, after a set period of time.',
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'MANAGEMENT',
          },
          darkWebMonitoring: {
            description:
              "Dark Web Monitoring scans hidden parts of the internet for Proton Mail email addresses that have ended up in illegal data markets. If our system detects a breach, you'll receive a Security Center alert along with actions you can take to mitigate the risk.",
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'GUARANTEE',
          },
          emailAdresses: {
            valueType: 'BOOLEAN',
            defaultValue: true,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          customEmailDomains: {
            description: 'Use your own custom email domain addresses, e.g., you@yourname.com',
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          messages: {
            description:
              'Bulk promotional or programmatic email sending is currently not supported. We recommend using a dedicated email service provider for this use case.',
            valueType: 'BOOLEAN',
            defaultValue: true,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          folders: {
            description: 'Keep your inbox organized with folders.',
            valueType: 'BOOLEAN',
            defaultValue: true,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          labels: {
            description:
              'Labels are simple tags you can add to messages to make them easier to find or to apply filters to.',
            valueType: 'BOOLEAN',
            defaultValue: true,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          customFilters: {
            valueType: 'BOOLEAN',
            defaultValue: true,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          attachments: {
            valueType: 'BOOLEAN',
            defaultValue: true,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          'short@pm.meAddress': {
            description:
              'Activate an extra and free email alias yourname@pm.me, easy to remember and share.',
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          contactGroups: {
            description:
              'Send emails to large groups quickly and easily by creating as many contact groups as you need (up to 100 contacts per group).',
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          emailClientSupport: {
            description:
              'Proton Mail supports desktop clients such as Outlook, Apple Mail, Thunderbird, etc. via Proton Mail Bridge.',
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          autoReply: {
            description:
              'Allows you to set up automatic responses (auto-reply) for your incoming messages.',
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          catchAllEmail: {
            description:
              "Ensures you receive all emails sent to your domain, even if the email address doesn't exist, no longer exists, or has a typo.",
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          automaticForwarding: {
            description: 'Automatically forward emails from Proton Mail to any other account.',
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          autoDeleteSpamAndTrash: {
            description: 'Automatically clear out messages older than 30 days from Trash and Spam.',
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          scheduleAndSnoozeEmails: {
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          protonScribeWritingAssistant: {
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          desktopApp: {
            valueType: 'BOOLEAN',
            defaultValue: false,
            type: 'INTEGRATION',
            integrationType: 'EXTERNAL_DEVICE',
            tag: 'Proton Mail',
          },
          htmlSignatures: {
            valueType: 'BOOLEAN',
            defaultValue: true,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          endToEndEncryption: {
            valueType: 'BOOLEAN',
            defaultValue: true,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          passwordProtectedEmails: {
            valueType: 'BOOLEAN',
            defaultValue: true,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          encryptedContactDetails: {
            valueType: 'BOOLEAN',
            defaultValue: true,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
          hideMyEmailAliases: {
            valueType: 'BOOLEAN',
            defaultValue: true,
            type: 'DOMAIN',
            tag: 'Proton Mail',
          },
        },
        usageLimits: {
          storageLimit: {
            description:
              'Storage space is shared across Proton Mail, Proton Calendar, and Proton Drive.',
            valueType: 'NUMERIC',
            defaultValue: 1,
            unit: 'GB',
            type: 'NON_RENEWABLE',
            trackable: true,
            linkedFeatures: ['storage'],
          },
          usersLimit: {
            valueType: 'NUMERIC',
            defaultValue: 1,
            unit: 'user',
            type: 'NON_RENEWABLE',
            trackable: true,
          },
          emailAdressesLimit: {
            valueType: 'NUMERIC',
            defaultValue: 1,
            unit: 'email',
            type: 'NON_RENEWABLE',
            trackable: true,
            linkedFeatures: ['emailAdresses'],
          },
          customEmailDomainsLimit: {
            valueType: 'NUMERIC',
            defaultValue: 0,
            unit: 'domain',
            type: 'NON_RENEWABLE',
            trackable: true,
            linkedFeatures: ['customEmailDomains'],
          },
          messagesLimit: {
            valueType: 'NUMERIC',
            defaultValue: 150,
            unit: 'message',
            type: 'RENEWABLE',
            period: {
              value: 1,
              unit: 'DAY',
            },
            linkedFeatures: ['messages'],
          },
          foldersLimit: {
            valueType: 'NUMERIC',
            defaultValue: 3,
            unit: 'folder',
            type: 'NON_RENEWABLE',
            trackable: true,
            linkedFeatures: ['folders'],
          },
          labelsLimit: {
            valueType: 'NUMERIC',
            defaultValue: 3,
            unit: 'label',
            type: 'NON_RENEWABLE',
            trackable: true,
            linkedFeatures: ['labels'],
          },
          customFiltersLimit: {
            valueType: 'NUMERIC',
            defaultValue: 1,
            unit: 'filter',
            type: 'NON_RENEWABLE',
            trackable: true,
            linkedFeatures: ['customFilters'],
          },
          attachmentsLimit: {
            valueType: 'NUMERIC',
            defaultValue: 25,
            unit: 'MB',
            type: 'NON_RENEWABLE',
            trackable: false,
            linkedFeatures: ['attachments'],
          },
          hideMyEmailAliasesLimit: {
            valueType: 'NUMERIC',
            defaultValue: 10,
            unit: 'email',
            type: 'NON_RENEWABLE',
            trackable: true,
            linkedFeatures: ['hideMyEmailAliases'],
          },
        },
        plans: {
          PROTON_FREE: {
            price: 0,
            unit: 'user/month',
            features: null,
            usageLimits: null,
          },
          MAIL_PLUS: {
            price: 4.99,
            unit: 'user/month',
            features: {
              priorityCustomerSupport: {
                value: true,
              },
              emergencyAccess: {
                value: true,
              },
              darkWebMonitoring: {
                value: true,
              },
              customEmailDomains: {
                value: true,
              },
              desktopApp: {
                value: true,
              },
              'short@pm.meAddress': {
                value: true,
              },
              contactGroups: {
                value: true,
              },
              emailClientSupport: {
                value: true,
              },
              autoReply: {
                value: true,
              },
              catchAllEmail: {
                value: true,
              },
              automaticForwarding: {
                value: true,
              },
              autoDeleteSpamAndTrash: {
                value: true,
              },
              scheduleAndSnoozeEmails: {
                value: true,
              },
            },
            usageLimits: {
              storageLimit: {
                value: 15,
              },
              emailAdressesLimit: {
                value: 10,
              },
              customEmailDomainsLimit: {
                value: 1,
              },
              messagesLimit: {
                value: null,
              },
              foldersLimit: {
                value: null,
              },
              labelsLimit: {
                value: null,
              },
              customFiltersLimit: {
                value: null,
              },
            },
          },
          PROTON_UNLIMITED: {
            price: 9.99,
            unit: 'user/month',
            features: {
              priorityCustomerSupport: {
                value: true,
              },
              protonSentinelProgram: {
                value: true,
              },
              emergencyAccess: {
                value: true,
              },
              darkWebMonitoring: {
                value: true,
              },
              desktopApp: {
                value: true,
              },
              customEmailDomains: {
                value: true,
              },
              'short@pm.meAddress': {
                value: true,
              },
              contactGroups: {
                value: true,
              },
              emailClientSupport: {
                value: true,
              },
              autoReply: {
                value: true,
              },
              catchAllEmail: {
                value: true,
              },
              automaticForwarding: {
                value: true,
              },
              autoDeleteSpamAndTrash: {
                value: true,
              },
              scheduleAndSnoozeEmails: {
                value: true,
              },
            },
            usageLimits: {
              storageLimit: {
                value: 500,
              },
              emailAdressesLimit: {
                value: 15,
              },
              customEmailDomainsLimit: {
                value: 3,
              },
              messagesLimit: {
                value: null,
              },
              foldersLimit: {
                value: null,
              },
              labelsLimit: {
                value: null,
              },
              customFiltersLimit: {
                value: null,
              },
              hideMyEmailAliasesLimit: {
                value: null,
              },
            },
          },
          PROTON_DUO: {
            price: 19.99,
            unit: 'user/month',
            features: {
              priorityCustomerSupport: {
                value: true,
              },
              protonSentinelProgram: {
                value: true,
              },
              emergencyAccess: {
                value: true,
              },
              darkWebMonitoring: {
                value: true,
              },
              desktopApp: {
                value: true,
              },
              customEmailDomains: {
                value: true,
              },
              'short@pm.meAddress': {
                value: true,
              },
              contactGroups: {
                value: true,
              },
              emailClientSupport: {
                value: true,
              },
              autoReply: {
                value: true,
              },
              catchAllEmail: {
                value: true,
              },
              automaticForwarding: {
                value: true,
              },
              autoDeleteSpamAndTrash: {
                value: true,
              },
              scheduleAndSnoozeEmails: {
                value: true,
              },
              protonScribeWritingAssistant: {
                value: true,
              },
            },
            usageLimits: {
              storageLimit: {
                value: 2000,
              },
              usersLimit: {
                value: 2,
              },
              emailAdressesLimit: {
                value: 30,
              },
              customEmailDomainsLimit: {
                value: 3,
              },
              messagesLimit: {
                value: null,
              },
              foldersLimit: {
                value: null,
              },
              labelsLimit: {
                value: null,
              },
              customFiltersLimit: {
                value: null,
              },
              hideMyEmailAliasesLimit: {
                value: null,
              },
            },
          },
        },
      },
    },
  },
];
