import PropTypes, { InferProps } from 'prop-types';
import { forwardRef, ReactElement, RefAttributes } from 'react';
import { Icon } from '@iconify/react';

type IconifyProps = {
    icon: ReactElement | string;
    width?: number;
    color?: string;
} & RefAttributes<HTMLSpanElement>;

const Iconify = forwardRef<HTMLSpanElement, IconifyProps>(
    ({ icon, width = 20, ...other }, ref) => (
        <span
            ref={ref}
            className="component-iconify inline-flex"
            {...other}
        >
            <Icon icon={icon as string} width={width} height={width} />
        </span>
    )
);

Iconify.propTypes = {
    icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    width: PropTypes.number,
    color: PropTypes.string,
} as InferProps<typeof Iconify.propTypes>;

export default Iconify;