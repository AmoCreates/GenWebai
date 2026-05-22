import API from "../api/axios.js";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";

const useGetCurrentUser = () => {
    const dispatch = useDispatch();
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const result = await API.get("/api/user/me", { withCredentials: true });
        dispatch(setUserData(result.data))
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    getCurrentUser();
  }, []);
};

export default useGetCurrentUser;
