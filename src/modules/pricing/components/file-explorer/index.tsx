import * as React from 'react';
import clsx from 'clsx';
import { animated, useSpring } from '@react-spring/web';
import { styled, alpha } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ArticleIcon from '@mui/icons-material/Article';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderRounded from '@mui/icons-material/FolderRounded';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { useTreeItem2, UseTreeItem2Parameters } from '@mui/x-tree-view/useTreeItem2';
import {
  TreeItem2Checkbox,
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2Label,
  TreeItem2Root,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { TreeItem2DragAndDropOverlay } from '@mui/x-tree-view/TreeItem2DragAndDropOverlay';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import Button from '@mui/material/Button';
import { AnalyticsData, AnalyticsDataEntry } from '../../../../assets/data/analytics';
import { IconButton } from '@mui/material';
import { Download, OpenInNew } from '@mui/icons-material';
import { parseStringYamlToEncodedYaml } from '../../../pricing-editor/services/export.service';
import { useRouter } from '../../../core/hooks/useRouter';

type FileType = 'image' | 'pdf' | 'doc' | 'video' | 'folder' | 'pinned' | 'trash';

type ExtendedTreeItemProps = {
  fileType?: FileType;
  id: string;
  label: string;
};

const ITEMS: TreeViewBaseItem<ExtendedTreeItemProps>[] = [
  {
    id: '1',
    label: 'Documents',
    children: [
      {
        id: '1.1',
        label: 'Company',
        children: [
          { id: '1.1.1', label: 'Invoice', fileType: 'pdf' },
          { id: '1.1.2', label: 'Meeting notes', fileType: 'doc' },
          { id: '1.1.3', label: 'Tasks list', fileType: 'doc' },
          { id: '1.1.4', label: 'Equipment', fileType: 'pdf' },
          { id: '1.1.5', label: 'Video conference', fileType: 'video' },
        ],
      },
      { id: '1.2', label: 'Personal', fileType: 'folder' },
      { id: '1.3', label: 'Group photo', fileType: 'image' },
    ],
  },
  {
    id: '2',
    label: 'Bookmarked',
    fileType: 'pinned',
    children: [
      { id: '2.1', label: 'Learning materials', fileType: 'folder' },
      { id: '2.2', label: 'News', fileType: 'folder' },
      { id: '2.3', label: 'Forums', fileType: 'folder' },
      { id: '2.4', label: 'Travel documents', fileType: 'pdf' },
    ],
  },
  { id: '3', label: 'History', fileType: 'folder' },
  { id: '4', label: 'Trash', fileType: 'trash' },
];

declare module 'react' {
  interface CSSProperties {
    '--tree-view-color'?: string;
    '--tree-view-bg-color'?: string;
  }
}

const StyledTreeItemRoot = styled(TreeItem2Root)(({ theme }) => ({
  color: theme.palette.grey[400],
  position: 'relative',
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: theme.spacing(3.5),
  },
  ...theme.applyStyles('light', {
    color: theme.palette.grey[800],
  }),
})) as unknown as typeof TreeItem2Root;

const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  flexDirection: 'row-reverse',
  borderRadius: theme.spacing(0.7),
  marginBottom: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  paddingRight: theme.spacing(1),
  fontWeight: 500,
  [`&.Mui-expanded `]: {
    '&:not(.Mui-focused, .Mui-selected, .Mui-selected.Mui-focused) .labelIcon': {
      color: theme.palette.primary.dark,
      ...theme.applyStyles('light', {
        color: theme.palette.primary.main,
      }),
    },
    '&::before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      left: '16px',
      top: '44px',
      height: 'calc(100% - 48px)',
      width: '1.5px',
      backgroundColor: theme.palette.grey[700],
      ...theme.applyStyles('light', {
        backgroundColor: theme.palette.grey[300],
      }),
    },
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: 'white',
    ...theme.applyStyles('light', {
      color: theme.palette.primary.main,
    }),
  },
  [`&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused`]: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
    ...theme.applyStyles('light', {
      backgroundColor: theme.palette.primary.main,
    }),
  },
}));

const AnimatedCollapse = animated(Collapse);

function TransitionComponent(props: TransitionProps) {
  const style = useSpring({
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(0,${props.in ? 0 : 20}px,0)`,
    },
  });

  return <AnimatedCollapse style={style} {...props} />;
}

const StyledTreeItemLabelText = styled(Typography)({
  color: 'inherit',
  fontFamily: 'inherit',
  fontWeight: 500,
  fontSize: '1rem',
}) as unknown as typeof Typography;

interface CustomLabelProps {
  children: React.ReactNode;
  icon?: React.ElementType;
  expandable?: boolean;
  fileType?: FileType;
  pricingData: AnalyticsDataEntry[];
}

function CustomLabel({
  icon: Icon,
  expandable,
  children,
  fileType,
  pricingData,
  ...other
}: CustomLabelProps) {

  const handleDownload = (children: React.ReactNode) => {
    if (!children) {
      alert('No file selected.');
      return;
    }
    const fileName = children.toString();

    if (fileName) {
      const link = document.createElement('a');
      link.href = "src/assets/"+fileName;
      link.download = "src/assets/"+fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`File path for ${fileName} not found.`);
    }
  };

  const handleOpen = (children: React.ReactNode) => {
    if (!children) {
      alert('No file selected.');
      return;
    }
    const fileName = children.toString();
    fetch("src/assets/"+fileName).then(async response => {
        const text = await response.text();
        let urlParam = parseStringYamlToEncodedYaml(text).split("pricing=")[1];
        window.open(`/editor?pricing=${urlParam}`, '_blank');
    });
  };

  return (
    <TreeItem2Label
      {...other}
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {Icon && (
        <Box
          component={Icon}
          className="labelIcon"
          color="inherit"
          sx={{ mr: 1, fontSize: '1.2rem' }}
        />
      )}

      <StyledTreeItemLabelText variant="body2">{children?.toString().split("/")[children?.toString().split("/").length-1]}</StyledTreeItemLabelText>
      <Box
        sx={{
          ml: 'auto',
          color: 'text.secondary',
          fontSize: '0.75rem',
          fontWeight: 400,
                }}
            >
            {/* 150 KB • 2 days ago */}
        {fileType === 'doc' && (
            <>
            <IconButton
                size="small"
                sx={{ ml: 1 }}
                onClick={() => handleDownload(children)}
            >
                <Download />
            </IconButton>
            <IconButton
                size="small"
                sx={{ ml: 1 }}
                onClick={() => handleOpen(children)}
            >
                <OpenInNew />
            </IconButton>
            </>
        )}
        </Box>
    </TreeItem2Label>
  );
}

const isExpandable = (reactChildren: React.ReactNode) => {
  if (Array.isArray(reactChildren)) {
    return reactChildren.length > 0 && reactChildren.some(isExpandable);
  }
  return Boolean(reactChildren);
};

const getIconFromFileType = (fileType: FileType) => {
  switch (fileType) {
    case 'image':
      return ImageIcon;
    case 'pdf':
      return PictureAsPdfIcon;
    case 'doc':
      return ArticleIcon;
    case 'video':
      return VideoCameraBackIcon;
    case 'folder':
      return FolderRounded;
    case 'pinned':
      return FolderOpenIcon;
    case 'trash':
      return DeleteIcon;
    default:
      return ArticleIcon;
  }
};

interface CustomTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: CustomTreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const { id, itemId, label, disabled, children, ...other } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    getDragAndDropOverlayProps,
    status,
    publicAPI,
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

  const item = publicAPI.getItem(itemId);
  const expandable = isExpandable(children);
  let icon;
  if (expandable) {
    icon = FolderRounded;
  } else if (item.fileType) {
    icon = getIconFromFileType(item.fileType);
  }

  return (
    <TreeItem2Provider itemId={itemId}>
      <StyledTreeItemRoot {...getRootProps(other)}>
        <CustomTreeItemContent
          {...getContentProps({
            className: clsx('content', {
              'Mui-expanded': status.expanded,
              'Mui-selected': status.selected,
              'Mui-focused': status.focused,
              'Mui-disabled': status.disabled,
            }),
          })}
        >
          <TreeItem2IconContainer {...getIconContainerProps()}>
            <TreeItem2Icon status={status} />
          </TreeItem2IconContainer>
          <TreeItem2Checkbox {...getCheckboxProps()} />
          <CustomLabel
                  pricingData={[]} {...getLabelProps({ icon, expandable: expandable && status.expanded })}
                  fileType={item.fileType}          />
          <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
        </CustomTreeItemContent>
        {children && <TransitionComponent {...getGroupTransitionProps()} />}
      </StyledTreeItemRoot>
    </TreeItem2Provider>
  );
});

export default function FileExplorer({ pricingData }: { pricingData: AnalyticsDataEntry[] }) {
    const [items, setItems] = React.useState<TreeViewBaseItem<ExtendedTreeItemProps>[]>([]);

React.useEffect(() => {
    const pricingItems = pricingData.map((entry, index) => ({
        id: `pricing-${index}`,
        label: entry.yaml_path,
        fileType: 'doc' as FileType,
    }));

    setItems([
        {
            id: 'pricings',
            label: 'Pricings',
            fileType: 'folder',
            children: pricingItems,
        }
    ]);
}, [pricingData]);

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h6" component="div">
                        File Explorer
                    </Typography>
                    {/* <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" component="div">
                            Size
                        </Typography>
                        <Typography variant="body2" component="div">
                            Last Modified
                        </Typography>
                    </Box> */}
                </Box>
                <RichTreeView
                    items={items}
                    defaultExpandedItems={['pricings']}
                    defaultSelectedItems="pricings"
                    sx={{ height: 'fit-content', flexGrow: 1, overflowY: 'auto' }}
                    slots={{ item: CustomTreeItem }}
                />
            </Box>
        </>
    );
}
