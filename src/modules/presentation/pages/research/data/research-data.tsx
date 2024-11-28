import { GrWorkshop } from 'react-icons/gr';
import { FaPlayCircle } from 'react-icons/fa';

import { primary } from '../../../../core/theme/palette';

const journalIconStyle = {
  background: primary[900],
  boxShadow: `0 0 0 4px ${primary[700]},inset 0 2px 0 rgba(0,0,0,.08),0 3px 0 4px rgba(0,0,0,.05)`,
};
const proceedingsIconStyle = {
  background: primary[800],
  boxShadow: `0 0 0 4px ${primary[700]},inset 0 2px 0 rgba(0,0,0,.08),0 3px 0 4px rgba(0,0,0,.05)`,
};
const demoIconStyle = {
  background: primary[700],
  boxShadow: `0 0 0 4px ${primary[700]},inset 0 2px 0 rgba(0,0,0,.08),0 3px 0 4px rgba(0,0,0,.05)`,
};
const posterIconStyle = {
  background: primary[600],
  boxShadow: `0 0 0 4px ${primary[700]},inset 0 2px 0 rgba(0,0,0,.08),0 3px 0 4px rgba(0,0,0,.05)`,
};

const timelineData = [
  {
    title: 'Racing the Market: An Industry Support Analysis for Pricing-Driven DevOps in SaaS',
    subtitle:
      'Alejandro García-Fernández, José Antonio Parejo, Francisco Javier Cavero and Antonio Ruiz-Cortés',
    text: ['22nd International Conference on Service-Oriented Computing (ICSOC)'],
    date: '2024-12-03',
    icon: <GrWorkshop stroke="white" />,
    iconStyle: proceedingsIconStyle,
    href: 'https://arxiv.org/abs/2409.15150',
  },
  {
    title: 'Towards Effective SaaS Pricing Design: A Case Study of CCSIM',
    subtitle:
      'Alejandro García-Fernández, Sergio Laso, José Antonio Parejo, Javier Berrocal, Antonio Ruiz-Cortés and Juan Manuel Murillo',
    text: [
      '20th International Workshop on Engineering Service-Oriented Applications and Cloud Services (WESOACS)',
    ],
    date: '2024-12-03',
    icon: <GrWorkshop stroke="white" />,
    iconStyle: proceedingsIconStyle,
    href: '#',
  },
  {
    title: 'From Static to Intelligent: Evolving SaaS Pricing with LLMs',
    subtitle: 'Francisco Javier Cavero, Juan C. Alonso, Antonio Ruiz-Cortés',
    text: ['1st International Workshop on Service-Oriented Computing for AI Applications (SOC4AI)'],
    date: '2024-12-03',
    icon: <GrWorkshop stroke="white" />,
    iconStyle: proceedingsIconStyle,
    href: '#',
  },
  {
    title: 'Towards Pricing4SaaS: A Framework for Pricing-driven Feature Toggling in SaaS',
    subtitle:
      'Alejandro García-Fernández, José Antonio Parejo, Pablo Trinidad and Antonio Ruiz-Cortés',
    text: ['24th International Conference on Web Engineering (ICWE)'],
    date: '2024-06-17',
    icon: <FaPlayCircle fill="white" />,
    iconStyle: demoIconStyle,
    href: 'https://link.springer.com/chapter/10.1007/978-3-031-62362-2_30',
  },
  {
    title: 'Towards a Suite of Software Libraries for Pricing-driven Feature Toggling',
    subtitle:
      'Alejandro García-Fernández, José Antonio Parejo, Pablo Trinidad and Antonio Ruiz-Cortés',
    text: ['Actas de las XIX Jornadas de Ciencia e Ingeniería de Servicios (JCIS)'],
    date: '2024-06-17',
    icon: <FaPlayCircle fill="white" />,
    iconStyle: demoIconStyle,
    href: 'https://biblioteca.sistedes.es/entities/artículo/16147fdc-2bae-477b-8b22-3d755358597a',
  },
  {
    title: 'Pricing-driven Development and Operation of SaaS: Challenges and Opportunities',
    subtitle: 'Alejandro García-Fernández, José Antonio Parejo and Antonio Ruiz-Cortés',
    text: ['Actas de las XIX Jornadas de Ciencia e Ingeniería de Servicios (JCIS)'],
    date: '2024-06-17',
    icon: <GrWorkshop stroke="white" />,
    iconStyle: proceedingsIconStyle,
    href: 'https://biblioteca.sistedes.es/entities/artículo/0d0e5e8e-59cd-4c34-b9a0-4de989221c87',
  },
  {
    title: 'Pricing4SaaS: Towards a Pricing Model to Drive the Operation of SaaS',
    subtitle: 'Alejandro García-Fernández, José Antonio Parejo and Antonio Ruiz-Cortés',
    text: ['36th International Conference on Advanced Information Systems Engineering (CAISE)'],
    date: '2024-06-03',
    icon: <GrWorkshop stroke="white" />,
    iconStyle: proceedingsIconStyle,
    href: 'https://link.springer.com/chapter/10.1007/978-3-031-61000-4_6',
  },
];

export default timelineData;
