import PropTypes, { InferProps } from 'prop-types';
import { forwardRef, ReactElement, RefAttributes } from 'react';
import { Icon } from '@iconify/react';

import Box from '@mui/material/Box';

type IconifyProps = {
    icon: ReactElement | string;
    width?: number;
    sx?: object;
    color?: string;
} & RefAttributes<unknown>;

const Iconify = forwardRef<unknown, IconifyProps>(
    ({ icon, width = 20, sx, ...other }, ref) => (
        <Box
            ref={ref}
            component={Icon}
            className="component-iconify"
            icon={icon as string}
            sx={{ width, height: width, ...sx }}
            {...other}
        />
    )
);

Iconify.propTypes = {
    icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    sx: PropTypes.object,
    width: PropTypes.number,
    color: PropTypes.string,
} as InferProps<typeof Iconify.propTypes>;

export default Iconify;