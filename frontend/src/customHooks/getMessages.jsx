import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { serverUrl } from "../main"
import { setMessages } from "../redux/messageSlice"

const getMessages = () => {
  const dispatch = useDispatch()
  const { selectedUser } = useSelector(state => state.user)

  useEffect(() => {
    if (!selectedUser?._id) return

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/message/get/${selectedUser._id}`,
          { withCredentials: true }
        )
        dispatch(setMessages(res.data))
      } catch (error) {
        console.log(error)
      }
    }

    fetchMessages()
  }, [selectedUser, dispatch])
}

export default getMessages
