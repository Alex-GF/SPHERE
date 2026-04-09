import * as React from 'react';
import { AnalyticsDataEntry } from '../../../../assets/data/analytics';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

type TreeItemType = {
  id: string;
  label: string;
  value?: number;
  children?: TreeItemType[];
};

const BASE_TREE: TreeItemType[] = [
  {
    id: 'pricing',
    label: 'Pricing',
    children: [
      {
        id: 'plans',
        label: 'Plans',
        value: 10,
        children: [
          { id: 'free', label: 'Free', value: 5 },
          { id: 'paid', label: 'Paid', value: 5 },
        ],
      },
      {
        id: 'features',
        label: 'Features',
        value: 30,
        children: [
          {
            id: 'automation',
            label: 'Automation',
            value: 5,
            children: [
              { id: 'bot', label: 'Bot', value: 2 },
              { id: 'filtering', label: 'Filtering', value: 3 },
              { id: 'tracking', label: 'Tracking', value: 0 },
              { id: 'taskAutomation', label: 'Task Automation', value: 0 },
            ],
          },
          { id: 'domain', label: 'Domain', value: 5 },
          { id: 'guarantee', label: 'Guarantee', value: 1 },
          { id: 'information', label: 'Information', value: 4 },
          {
            id: 'integration',
            label: 'Integration',
            value: 5,
            children: [
              { id: 'api', label: 'API', value: 3 },
              { id: 'extension', label: 'Extension', value: 1 },
              { id: 'identityProvider', label: 'Identity Provider', value: 0 },
              { id: 'webSaas', label: 'Web SaaS', value: 1 },
              { id: 'marketplace', label: 'Marketplace', value: 0 },
              { id: 'externalDevice', label: 'External Device', value: 0 },
            ],
          },
          { id: 'management', label: 'Management', value: 0 },
          { id: 'support', label: 'Support', value: 5 },
          { id: 'payment', label: 'Payment', value: 5 },
        ],
      },
      {
        id: 'usageLimits',
        label: 'Usage Limits',
        value: 15,
        children: [
          { id: 'renewable', label: 'Renewable', value: 5 },
          { id: 'nonRenewable', label: 'Non-Renewable', value: 10 },
          { id: 'responseDriven', label: 'Response-Driven', value: 0 },
          { id: 'timeDriven', label: 'Time-Driven', value: 0 },
        ],
      },
      {
        id: 'addOns',
        label: 'Add-Ons',
        value: 10,
        children: [
          { id: 'singleton', label: 'Singleton', value: 5 },
          { id: 'usageBased', label: 'Usage-Based', value: 5 },
        ],
      },
    ],
  },
];

function getWordsEnding(value: number, itemId: string) {
  let result = '';

  switch (itemId) {
    case 'plans':
    case 'free':
    case 'paid':
      result = 'plans';
      break;
    case 'features':
    case 'automation':
    case 'bot':
    case 'filtering':
    case 'tracking':
    case 'taskAutomation':
    case 'domain':
    case 'guarantee':
    case 'information':
    case 'integration':
    case 'api':
    case 'extension':
    case 'identityProvider':
    case 'webSaas':
    case 'marketplace':
    case 'externalDevice':
    case 'management':
    case 'support':
    case 'payment':
      result = 'features';
      break;
    case 'usageLimits':
    case 'renewable':
    case 'nonRenewable':
    case 'responseDriven':
    case 'timeDriven':
      result = 'usage limits';
      break;
    case 'addOns':
    case 'singleton':
    case 'usageBased':
      result = 'add-ons';
      break;
    default:
      result = 'items';
      break;
  }

  return value === 1 ? result.slice(0, -1) : result;
}

function findItemById(tree: TreeItemType[], itemId: string): TreeItemType | null {
  for (const node of tree) {
    if (node.id === itemId) {
      return node;
    }

    if (node.children) {
      const result = findItemById(node.children, itemId);
      if (result) {
        return result;
      }
    }
  }

  return null;
}

function buildCounter(tree: TreeItemType[], itemId: string): string {
  const item = findItemById(tree, itemId);
  if (item) {
    const value = item.value ?? 0;
    return `${value} ${getWordsEnding(value, itemId)}`;
  }

  return `0 ${getWordsEnding(0, itemId)}`;
}

type TreeNodeProps = {
  tree: TreeItemType[];
  node: TreeItemType;
  level?: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  focusedId: string;
  onFocus: (id: string) => void;
};

function TreeNode({
  tree,
  node,
  level = 0,
  expandedIds,
  onToggle,
  focusedId,
  onFocus,
}: TreeNodeProps) {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isExpanded = expandedIds.has(node.id);
  const isFocused = focusedId === node.id;
  const countLabel = node.id !== 'pricing' ? buildCounter(tree, node.id) : '';

  return (
    <li key={node.id}>
      <button
        type="button"
        className={`flex w-full items-center rounded-md px-2 py-1.5 text-left transition-colors ${isFocused ? 'bg-[#d8edf4]' : 'bg-white hover:bg-slate-100'}`}
        style={{ paddingLeft: `${level * 22 + 8}px` }}
        onClick={() => {
          onFocus(node.id);
          if (hasChildren) {
            onToggle(node.id);
          }
        }}
      >
        <span className="mr-1.5 inline-flex w-4 items-center justify-center text-slate-600">
          {hasChildren ? (isExpanded ? <FiChevronDown /> : <FiChevronRight />) : null}
        </span>
        <span className="font-medium text-slate-800">{node.label}</span>
        {countLabel && (
          <>
            <span className="mx-2 mt-0.5 flex-1 border-b border-dotted border-slate-500/80" aria-hidden />
            <span className="text-slate-500">{countLabel}</span>
          </>
        )}
      </button>

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && node.children && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                tree={tree}
                node={child}
                level={level + 1}
                expandedIds={expandedIds}
                onToggle={onToggle}
                focusedId={focusedId}
                onFocus={onFocus}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

type PricingTreeProps = {
  pricing: AnalyticsDataEntry | null;
  name: string | undefined;
};

export default function PricingTree({ pricing, name }: PricingTreeProps) {
  const [treeItem, setTreeItem] = React.useState<TreeItemType[]>(BASE_TREE);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => new Set(['pricing', 'features']));
  const [focusedId, setFocusedId] = React.useState<string>('features');

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  function getProperValue(currentPricing: AnalyticsDataEntry, itemId: string): number {
    switch (itemId) {
      case 'plans':
        return currentPricing.analytics.numberOfPlans;
      case 'free':
        return currentPricing.analytics.numberOfFreePlans;
      case 'paid':
        return currentPricing.analytics.numberOfPaidPlans;
      case 'features':
        return currentPricing.analytics.numberOfFeatures;
      case 'automation':
        return currentPricing.analytics.numberOfAutomationFeatures;
      case 'bot':
        return currentPricing.analytics.numberOfBotAutomationFeatures;
      case 'filtering':
        return currentPricing.analytics.numberOfFilteringAutomationFeatures;
      case 'tracking':
        return currentPricing.analytics.numberOfTrackingAutomationFeatures;
      case 'taskAutomation':
        return currentPricing.analytics.numberOfTaskAutomationFeatures;
      case 'domain':
        return currentPricing.analytics.numberOfDomainFeatures;
      case 'guarantee':
        return currentPricing.analytics.numberOfGuaranteeFeatures;
      case 'information':
        return currentPricing.analytics.numberOfInformationFeatures;
      case 'integration':
        return currentPricing.analytics.numberOfIntegrationFeatures;
      case 'api':
        return currentPricing.analytics.numberOfIntegrationApiFeatures;
      case 'extension':
        return currentPricing.analytics.numberOfIntegrationExtensionFeatures;
      case 'identityProvider':
        return currentPricing.analytics.numberOfIntegrationIdentityProviderFeatures;
      case 'webSaas':
        return currentPricing.analytics.numberOfIntegrationWebSaaSFeatures;
      case 'marketplace':
        return currentPricing.analytics.numberOfIntegrationMarketplaceFeatures;
      case 'externalDevice':
        return currentPricing.analytics.numberOfIntegrationExternalDeviceFeatures;
      case 'management':
        return currentPricing.analytics.numberOfManagementFeatures;
      case 'support':
        return currentPricing.analytics.numberOfSupportFeatures;
      case 'payment':
        return currentPricing.analytics.numberOfPaymentFeatures;
      case 'usageLimits':
        return currentPricing.analytics.numberOfUsageLimits;
      case 'renewable':
        return currentPricing.analytics.numberOfRenewableUsageLimits;
      case 'nonRenewable':
        return currentPricing.analytics.numberOfNonRenewableUsageLimits;
      case 'responseDriven':
        return currentPricing.analytics.numberOfResponseDrivenUsageLimits;
      case 'timeDriven':
        return currentPricing.analytics.numberOfTimeDrivenUsageLimits;
      case 'addOns':
        return currentPricing.analytics.numberOfAddOns;
      case 'singleton':
        return currentPricing.analytics.numberOfReplacementAddons;
      case 'usageBased':
        return currentPricing.analytics.numberOfExtensionAddons;
      default:
        return 0;
    }
  }

  React.useEffect(() => {
    if (!pricing) {
      return;
    }

    const updateTreeValues = (items: TreeItemType[]): TreeItemType[] => {
      return items.map(item => {
        const value = getProperValue(pricing, item.id);
        if (item.id !== 'pricing') {
          return {
            ...item,
            value,
            children: value === 0 ? undefined : item.children ? updateTreeValues(item.children) : undefined,
          };
        }

        return {
          ...item,
          children: item.children ? updateTreeValues(item.children) : undefined,
        };
      });
    };

    setTreeItem(updateTreeValues(BASE_TREE));
  }, [pricing]);

  return (
    <div className="min-h-[200px] min-w-[350px]">
      <div className="mb-2 flex items-center gap-1 p-4">
        <h3 className="text-xl">Pricing tree for</h3>
        <span className="font-mono text-xl text-slate-500">{name}</span>
      </div>
      <ul className="space-y-1">
        {treeItem.map(item => (
          <TreeNode
            key={item.id}
            tree={treeItem}
            node={item}
            expandedIds={expandedIds}
            onToggle={handleToggle}
            focusedId={focusedId}
            onFocus={setFocusedId}
          />
        ))}
      </ul>
    </div>
  );
}
