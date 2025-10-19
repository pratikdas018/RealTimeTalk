import React, { useRef, useEffect } from 'react'
import dp from '../assets/dp.webp'
import { useSelector } from 'react-redux'

function SenderMessage({ image, message }) {
  const scroll = useRef()
  const { userData } = useSelector(state => state.user)

  useEffect(() => {
    scroll?.current.scrollIntoView({ behavior: "smooth" })
  }, [message, image])

  const handleImageScroll = () => {
    scroll?.current.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div
      ref={scroll}
      className='w-full flex justify-end items-end gap-2 px-3 sm:px-4'
    >
      {/* Message bubble */}
      <div
        className='max-w-[80%] sm:max-w-[500px] px-4 py-2
        bg-[rgb(23,151,194)] text-white text-[16px] sm:text-[18px]
        rounded-2xl rounded-tr-none shadow-md flex flex-col gap-2
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

      {/* Sender DP — neatly beside the bubble */}
      <div
        className='w-[32px] h-[32px] sm:w-[40px] sm:h-[40px]
        bg-white rounded-full overflow-hidden flex-shrink-0
        shadow-md border border-[rgb(23,151,194)]'
      >
        <img
          src={userData?.image || dp}
          alt=""
          className='w-full h-full object-cover'
        />
      </div>
    </div>
  )
}

export default SenderMessage
