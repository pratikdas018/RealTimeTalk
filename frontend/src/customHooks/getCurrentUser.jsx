import axios from "axios"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { serverUrl } from "../main"
import { setUserData } from "../redux/userSlice"

const getCurrentUser = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/user/current`,
          { withCredentials: true }
        )
        dispatch(setUserData(res.data))
      } catch (error) {
        // user not logged in → ignore
        console.log("No current user")
      }
    }

    fetchUser()
  }, [dispatch])
}

export default getCurrentUser
