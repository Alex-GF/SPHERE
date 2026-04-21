export default function BackgroundOrbs() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.025] [background-image:radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.9)_1px,transparent_0)] [background-size:4px_4px]" />
      <div className="pointer-events-none absolute inset-0 z-[2]">
        <div className="absolute -left-28 top-[10%] h-[28rem] w-[28rem] rounded-full bg-[#d6f4e8] blur-[140px]" />
        <div className="absolute right-[-8rem] top-[20%] h-[34rem] w-[34rem] rounded-full bg-[#dbeafe] blur-[160px]" />
        <div className="absolute bottom-[-11rem] left-[35%] h-[24rem] w-[24rem] rounded-full bg-[#ffe7cc] blur-[140px]" />
      </div>
    </>
  );
}
