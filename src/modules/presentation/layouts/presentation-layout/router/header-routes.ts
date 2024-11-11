export interface HeaderRoute {
  name: string;
  disabled: boolean;
  to?: string;
  children?: HeaderRoute[];
}

export const headerRoutes: HeaderRoute[] = [
  {
    name: 'Tools',
    disabled: false,
    children: [
      {
        name: 'Pricing2Yaml Editor',
        disabled: false,
        to: '/editor',
      },
    ],
  },
  {
    name: 'Team',
    disabled: false,
    to: '/team',
  },
  {
    name: 'Activities',
    disabled: false,
    to: '/activities',
  },
  {
    name: 'Contribute',
    disabled: false,
    to: '/contributions',
  },
];
