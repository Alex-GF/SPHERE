export interface HeaderRoute{
    name: string;
    disabled: boolean;
    to?: string;
    children?: HeaderRoute[];
}

export const headerRoutes: HeaderRoute[] = [
    {
      name: 'Team',
      disabled: false,
      to: "/team"
    },
    {
      name: 'Activities',
      disabled: false,
      to: "/activities"
    },
    {
      name: 'Contribute',
      disabled: false,
      to: "/contributions"
    },
    // {
    //   name: 'Publications',
    //   disabled: false,
    //   children: [
    //     {
    //       name: 'Papers',
    //       disabled: false,
    //       to: "/papers"
    //     }
    //   ],
    // }
  ];