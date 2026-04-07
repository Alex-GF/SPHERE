import 'react-vertical-timeline-component/style.min.css';
import './styles.css';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import { FaStar, FaAward } from 'react-icons/fa';
import timelineData from './data/research-data';
import { Helmet } from 'react-helmet';
import { primary } from '../../../core/theme/palette';
import { Link } from 'react-router-dom';

export default function ResearchPage() {
  return (
    <>
      <Helmet>
        <title> SPHERE - Research </title>
      </Helmet>
      <div className="h-full w-full overflow-y-scroll bg-[#f5f5f5] p-2">
        <VerticalTimeline lineColor={primary[700]} className="research-timeline">
          {timelineData.map((item, index) => (
            <VerticalTimelineElement
              key={index}
              date={item.date}
              dateClassName="date-style"
              className={`research-timeline-element research-timeline-element--${item.variant}`}
              icon={item.icon}
              iconClassName="research-timeline-element-icon"
              textClassName="relative"
            >
              <div className="bg-transparent p-2 shadow-none">
                <Link to={item.href} target="_blank" rel="noopener noreferrer">
                  <h3 className="text-2xl font-bold text-sphere-primary-700 underline underline-offset-2">
                    {item.title}
                  </h3>
                </Link>
                <p className="mb-1 text-base text-sphere-primary-700">
                  {item.subtitle}
                </p>
                {item.text.map((element, idx) => (
                  <p className="text-sm text-black" key={idx}>
                    {element}
                  </p>
                ))}
                {item.awards && (
                  <div className="mt-[1.2rem] font-bold">
                    This work has been awarded with:
                    <ul className="list-disc">
                      {item.awards.map((award, idx) => (
                        <li key={idx} className="ml-10 list-item">{award}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {item.awards && (
                <div className="absolute right-[-30px] top-[-30px] flex h-[80px] w-[80px] items-center justify-center rounded-full border-4 border-sphere-primary-700 bg-white">
                  <FaAward color={`${primary[700]}`} fontSize={40} />
                </div>
              )}
            </VerticalTimelineElement>
          ))}
          <VerticalTimelineElement className="research-timeline-element research-timeline-element--final" icon={<FaStar />} iconClassName="research-timeline-element-icon" />
        </VerticalTimeline>
      </div>
    </>
  );
}
