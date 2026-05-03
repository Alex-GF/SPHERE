import { FaCode } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { LuExpand } from 'react-icons/lu';
import { useState } from "react";


export default function Harvey() {

    const [message, setMessage] = useState('')

    return (
        <>
              <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">HARVEY</h3>
                  <button type="button" title="Expand chat" className="rounded-full p-2 hover:bg-slate-100">
                      <LuExpand />
                  </button>
              </div>
              <div className="mt-2">
                <textarea
                  className="min-h-28 w-full rounded-md border border-slate-300 p-3 outline-none focus:border-sphere-primary-500"
                  placeholder="Input a message to start chatting with HARVEY..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
                <div className="mt-2 flex items-center justify-between">
                  <button type="button" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100">
                    <FaCode />
                    View Code
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md bg-sphere-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-sphere-primary-700"
                    onClick={() => setMessage('')}
                  >
                    <IoIosSend />
                    Send
                  </button>
                </div>
              </div>
            </>
    );
}