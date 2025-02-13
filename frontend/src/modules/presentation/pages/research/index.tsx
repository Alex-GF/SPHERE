import 'react-vertical-timeline-component/style.min.css';
import './styles.css';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import { FaStar, FaAward } from 'react-icons/fa';
import timelineData from './data/research-data';
import { Helmet } from 'react-helmet';
import { Box, Typography, Paper, List, ListItem } from '@mui/material';
import { primary } from '../../../core/theme/palette';
import { Link } from 'react-router-dom';

const timelineContentBoxStyle = {
  border: `2px solid ${primary[700]}`,
  color: '#fff',
  background: 'transparent',
  boxShadow: 'none',
};
const timelineArrowStyle = { borderRight: `7px solid  ${primary[700]}` };
const finalIconStyle = {
  background: 'white',
  boxShadow: `0 0 0 4px ${primary[700]},inset 0 2px 0 rgba(0,0,0,.08),0 3px 0 4px rgba(0,0,0,.05)`,
};

export default function ResearchPage() {
  return (
    <>
      <Helmet>
        <title> SPHERE - Research </title>
      </Helmet>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          overflowY: 'scroll',
          backgroundColor: '#f5f5f5',
          padding: 2,
        }}
      >
        <VerticalTimeline lineColor={primary[700]}>
          {timelineData.map((item, index) => (
            <VerticalTimelineElement
              key={index}
              contentStyle={timelineContentBoxStyle}
              contentArrowStyle={timelineArrowStyle}
              date={item.date}
              dateClassName="date-style"
              iconStyle={item.iconStyle}
              icon={item.icon}
              style={{ position: 'relative' }}
            >
              <Paper sx={{ p: 2, backgroundColor: 'transparent', boxShadow: 'none' }}>
                <Link to={item.href} target="_blank" rel="noopener noreferrer">
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 'bold',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                      color: primary[700],
                    }}
                  >
                    {item.title}
                  </Typography>
                </Link>
                <Typography variant="subtitle1" sx={{ mb: 1, color: primary[700] }}>
                  {item.subtitle}
                </Typography>
                {item.text.map((element, idx) => (
                  <Typography variant="body2" key={idx} sx={{ color: 'black' }}>
                    {element}
                  </Typography>
                ))}
                {item.awards && (
                  <Box sx={{ fontWeight: 'bold', marginTop: '1.2rem' }}>
                    This work has been awarded with:
                    <List sx={{ listStyleType: 'disc' }}>
                      {item.awards.map((award, idx) => (
                        <ListItem key={idx} sx={{ display: 'list-item', marginLeft: "40px" }}>{award}</ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Paper>
              {item.awards && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    height: '80px',
                    width: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    border: `4px solid ${primary[700]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FaAward color={`${primary[700]}`} fontSize={40} />
                </Box>
              )}
            </VerticalTimelineElement>
          ))}
          <VerticalTimelineElement iconStyle={finalIconStyle} icon={<FaStar />} />
        </VerticalTimeline>
      </Box>
    </>
  );
}
