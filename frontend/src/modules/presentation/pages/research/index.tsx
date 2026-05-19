import 'react-vertical-timeline-component/style.min.css';
import './styles.css';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import { FaStar, FaAward } from 'react-icons/fa';
import timelineData from './data/research-data';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function ResearchPage() {
  return (
    <>
      <Helmet>
        <title> SPHERE - Research </title>
      </Helmet>
      <div className="h-full w-full overflow-y-scroll bg-[#f5f5f5] p-2 pb-10">
        <VerticalTimeline lineColor="#FA5210" className="research-timeline">
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
                <Link to={item.href} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                  <h3 className="text-2xl font-bold text-tp-ink underline underline-offset-2">
                    {item.title}
                  </h3>
                </Link>
                <p className="mb-1 text-base text-tp-ink">
                  {item.subtitle}
                </p>
                {item.text.map((element, idx) => (
                  <p className="text-sm text-tp-ink" key={idx}>
                    {element}
                  </p>
                ))}
                {item.awards && (
                  <div className="mt-[1.2rem] font-bold text-tp-ink">
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
                <div className="absolute -right-7.5 -top-7.5 flex h-20 w-20 items-center justify-center rounded-full border-4 border-tp-primary bg-white">
                  <FaAward color="#FA5210" fontSize={40} />
                </div>
              )}
            </VerticalTimelineElement>
          ))}
          <VerticalTimelineElement
            className="research-timeline-element research-timeline-element--final"
            icon={<FaStar />}
            iconClassName="research-timeline-element-icon research-timeline-element-icon--final"
            contentStyle={{ display: 'none' }}
            contentArrowStyle={{ display: 'none' }}
          />
        </VerticalTimeline>
      </div>
    </>
  );
}
