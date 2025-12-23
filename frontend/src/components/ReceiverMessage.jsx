import React, { useRef, useEffect } from 'react'
import dp from '../assets/dp.webp'
import { useSelector } from 'react-redux'

function ReceiverMessage({ image, message }) {
  const scroll = useRef()
  const { selectedUser } = useSelector(state => state.user)  // ✅ use Redux user data

  useEffect(() => {
    scroll?.current.scrollIntoView({ behavior: "smooth" })
  }, [message, image])

  const handleImageScroll = () => {
    scroll?.current.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div
      ref={scroll}
      className='w-full flex justify-start items-end gap-2 px-3 sm:px-4'
    >
      {/* ✅ Receiver DP */}
      <div
        className='w-[32px] h-[32px] sm:w-[40px] sm:h-[40px]
        bg-white rounded-full overflow-hidden flex-shrink-0
        shadow-md border border-[#20c7ff]'
      >
        <img
          src={selectedUser?.avatar || dp}  // ✅ Fallback ensures DP always shows
          alt="receiver"
          className='w-full h-full object-cover'
        />
      </div>

      {/* ✅ Message Bubble */}
      <div
        className='max-w-[80%] sm:max-w-[500px] px-4 py-2
        bg-[#20c7ff] text-white text-[16px] sm:text-[18px]
        rounded-2xl rounded-tl-none shadow-md flex flex-col gap-2
        break-words'
      >
        {image && (
          <img
            src={image}
            alt=""
            className='w-[120px] sm:w-[150px] rounded-lg object-cover'
            onLoad={handleImageScroll}
          />
        )}
        {message && <span>{message}</span>}
      </div>
    </div>
  )
}

export default ReceiverMessage
