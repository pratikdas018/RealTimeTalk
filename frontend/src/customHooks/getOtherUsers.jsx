import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { serverUrl } from "../main"
import { setOtherUsers } from "../redux/userSlice"

const getOtherUsers = () => {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)

  useEffect(() => {
    if (!userData) return

    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/user/others`,
          { withCredentials: true }
        )
        dispatch(setOtherUsers(res.data))
      } catch (error) {
        console.log(error)
      }
    }

    fetchUsers()
  }, [userData, dispatch])
}

export default getOtherUsers
