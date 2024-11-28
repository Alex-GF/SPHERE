import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { useTreeItem2 } from '@mui/x-tree-view/useTreeItem2';
import {
  TreeItem2Content,
  TreeItem2Root,
  TreeItem2Props,
  TreeItem2GroupTransition,
  TreeItem2IconContainer,
  TreeItem2Label,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { AnalyticsDataEntry } from '../../../../assets/data/analytics';

type TreeItemType = {
  id: string;
  label: string;
  value?: number;
  children?: TreeItemType[];
};

let MUI_X_PRODUCTS: TreeViewBaseItem<TreeItemType>[] = [
  {
    id: 'pricing',
    label: 'Pricing',
    children: [
        { id: 'plans', label: 'Plans', value: 10, children: [
            { id: 'free', label: 'Free', value: 5 },
            { id: 'paid', label: 'Paid', value: 5 },
        ] },
        { id: 'features', label: 'Features', value: 30,
            children: [
                { id: 'automation', label: 'Automation', value: 5,
                    children: [
                        { id: 'bot', label: 'Bot', value: 2 },
                        { id: 'filtering', label: 'Filtering', value: 3 },
                        { id: 'tracking', label: 'Tracking', value: 0 },
                        { id: 'taskAutomation', label: 'Task Automation', value: 0 },
                    ]
                },
                { id: 'domain', label: 'Domain', value: 5 },
                { id: 'guarantee', label: 'Guarantee', value: 1 },
                { id: 'information', label: 'Information', value: 4 },
                { id: 'integration', label: 'Integration', value: 5,
                    children: [
                        { id: 'api', label: 'API', value: 3 },
                        { id: 'extension', label: 'Extension', value: 1 },
                        { id: 'identityProvider', label: 'Identity Provider', value: 0 },
                        { id: 'webSaas', label: 'Web SaaS', value: 1 },
                        { id: 'marketplace', label: 'Marketplace', value: 0 },
                        { id: 'externalDevice', label: 'External Device', value: 0 },
                    ]
                },
                { id: 'management', label: 'Management', value: 0 },
                { id: 'support', label: 'Support', value: 5 },
                { id: 'payment', label: 'Payment', value: 5 },
            ]

        },
        { id: 'usageLimits', label: 'Usage Limits', value: 15,
            children: [
                { id: 'renewable', label: 'Renewable', value: 5 },
                { id: 'nonRenewable', label: 'Non-Renewable', value: 10 },
                { id: 'responseDriven', label: 'Response-Driven', value: 0 },
                { id: 'timeDriven', label: 'Time-Driven', value: 0 },
            ]
         },
        { id: 'addOns', label: 'Add-Ons', value: 10,
            children: [
                { id: 'singleton', label: 'Singleton', value: 5 },
                { id: 'usageBased', label: 'Usage-Based', value: 5 },
            ]
        },
    ],
  }
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
        return node; // Found the item
      }
  
      // If the node has children, recursively search within them
      if (node.children) {
        const result = findItemById(node.children, itemId);
        if (result) {
          return result; // Found in children
        }
      }
    }
  
    return null; // Not found
  };

function buildCounter(tree: TreeItemType[], itemId: string): string {
    const item = findItemById(tree, itemId);
    if (item) {
        const value = item.value ?? 0;
        return `${value} ${getWordsEnding(value, itemId)}`;
    }
    return `0 ${getWordsEnding(0, itemId)}`;
}

type CustomTreeItemProps = TreeItem2Props & { treeItem: TreeItemType[] };

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  { id, itemId, label, children, treeItem }: CustomTreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const {
    getRootProps,
    getContentProps,
    getLabelProps,
    getGroupTransitionProps,
    getIconContainerProps,
    status,
  } = useTreeItem2({ id, itemId, label, children, rootRef: ref });

  return (
    <TreeItem2Provider itemId={itemId}>
      <TreeItem2Root {...getRootProps()}>
        <TreeItem2Content {...getContentProps()}>
            <Box sx={{ display: 'flex', direction: "row", justifyContent: "space-between", width: "100%", alignItems: "center"}}>
                <TreeItem2IconContainer {...getIconContainerProps()}>
                    <TreeItem2Icon status={status}/>
                </TreeItem2IconContainer>

                <TreeItem2Label {...getLabelProps()} sx={itemId !== 'pricing' ? {width: 'auto'} : {}}/>

                {itemId !== 'pricing' &&
                <>
                    <Box sx={{ flexGrow: 1, borderBottom: '1px dotted', borderColor: 'text.secondary', mx: 1, width: 'auto' }} />
                    <Box sx={{ display: 'flex', direction: "row", width: 'auto'}}>
                        <Typography variant="caption" color="text.secondary">
                            {buildCounter(treeItem, itemId)}
                        </Typography>
                    </Box>
                </>
                } 
            </Box>
        </TreeItem2Content>
        {children && <TreeItem2GroupTransition {...getGroupTransitionProps()}/>}
      </TreeItem2Root>
    </TreeItem2Provider>
  );
});

type PricingTreeProps = {
  pricing: AnalyticsDataEntry | null;
  name: string | undefined;
};

export default function PricingTree({ pricing, name }: PricingTreeProps) {
  const [treeItem, setTreeItem] = React.useState<TreeItemType[]>(MUI_X_PRODUCTS);

  function getProperValue(pricing: AnalyticsDataEntry, itemId: string): number {
    switch (itemId) {
      case 'plans':
        return pricing?.analytics.numberOfPlans;
      case 'free':
        return pricing?.analytics.numberOfFreePlans;
      case 'paid':
        return pricing?.analytics.numberOfPaidPlans;
      case 'features':
        return pricing?.analytics.numberOfFeatures;
      case 'automation':
        return pricing?.analytics.numberOfAutomationFeatures;
      case 'bot':
        return pricing?.analytics.numberOfBotAutomationFeatures;
      case 'filtering':
        return pricing?.analytics.numberOfFilteringAutomationFeatures;
      case 'tracking':
        return pricing?.analytics.numberOfTrackingAutomationFeatures;
      case 'taskAutomation':
        return pricing?.analytics.numberOfTaskAutomationFeatures;
      case 'domain':
        return pricing?.analytics.numberOfDomainFeatures;
      case 'guarantee':
        return pricing?.analytics.numberOfGuaranteeFeatures;
      case 'information':
        return pricing?.analytics.numberOfInformationFeatures;
      case 'integration':
        return pricing?.analytics.numberOfIntegrationFeatures;
      case 'api':
        return pricing?.analytics.numberOfIntegrationApiFeatures;
      case 'extension':
        return pricing?.analytics.numberOfIntegrationExtensionFeatures;
      case 'identityProvider':
        return pricing?.analytics.numberOfIntegrationIdentityProviderFeatures;
      case 'webSaas':
        return pricing?.analytics.numberOfIntegrationWebSaaSFeatures;
      case 'marketplace':
        return pricing?.analytics.numberOfIntegrationMarketplaceFeatures;
      case 'externalDevice':
        return pricing?.analytics.numberOfIntegrationExternalDeviceFeatures;
      case 'management':
        return pricing?.analytics.numberOfManagementFeatures;
      case 'support':
        return pricing?.analytics.numberOfSupportFeatures;
      case 'payment':
        return pricing?.analytics.numberOfPaymentFeatures;
      case 'usageLimits':
        return pricing?.analytics.numberOfUsageLimits;
      case 'renewable':
        return pricing?.analytics.numberOfRenewableUsageLimits;
      case 'nonRenewable':
        return pricing?.analytics.numberOfNonRenewableUsageLimits;
      case 'responseDriven':
        return pricing?.analytics.numberOfResponseDrivenUsageLimits;
      case 'timeDriven':
        return pricing?.analytics.numberOfTimeDrivenUsageLimits;
      case 'addOns':
        return pricing?.analytics.numberOfAddOns;
      case 'singleton':
        return pricing?.analytics.numberOfReplacementAddons;
      case 'usageBased':  
        return pricing?.analytics.numberOfExtensionAddons;
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
      if (item.id !== 'pricing') {
        return {
        ...item,
        value: getProperValue(pricing, item.id),
        children: item.children ? updateTreeValues(item.children) : undefined,
        };
      }
      return {
        ...item,
        children: item.children ? updateTreeValues(item.children) : undefined,
      };
      });
    };

    const newTreeItem = updateTreeValues(treeItem);

    setTreeItem(newTreeItem);
  }, [pricing]);

  return (
      <Box sx={{ minHeight: 200, minWidth: 350 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
            <Typography variant="h6" gutterBottom>
                Pricing tree for
            </Typography>
            <Typography variant="h6" gutterBottom color="text.secondary" fontFamily="monospace" letterSpacing={0.25}>
                sphere/{name}
            </Typography>
        </Box>
        <RichTreeView
          items={treeItem}
          defaultExpandedItems={['pricing']}
          slots={{ item: (props: TreeItem2Props) => <CustomTreeItem {...props} treeItem={treeItem} /> }}
        />
      </Box>
  );
}
