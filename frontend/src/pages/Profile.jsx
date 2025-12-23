import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import dp from "../assets/dp.webp";
import { IoCameraOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../main";
import { setUserData, updateSelectedUser } from "../redux/userSlice";

function Profile() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ correct fields
  const [fullName, setFullName] = useState(userData?.fullName || "");
  const [frontendImage, setFrontendImage] = useState(
    userData?.avatar || dp
  );
  const [backendImage, setBackendImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const imageRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleProfile = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    const formData = new FormData();
    formData.append("fullName", fullName);
    if (backendImage) {
      formData.append("avatar", backendImage);
    }

    const res = await axios.put(
      `${serverUrl}/api/user/profile`,
      formData,
      { withCredentials: true }
    );

    // ✅ Update Redux
    dispatch(setUserData(res.data));
    dispatch(updateSelectedUser(res.data));

    // ✅ SUCCESS TOAST (HERE)
    toast.success("Profile updated successfully 🎉");

    // ⏳ Optional delay for better UX
    setTimeout(() => {
      navigate("/");
    }, 800);

  } catch (error) {
    console.error("Profile update error:", error);

    // ❌ ERROR TOAST (HERE)
    toast.error("Profile update failed");
  } finally {
    setSaving(false);
  }
};


  return (
    <div className="w-full h-[100vh] bg-slate-200 flex flex-col justify-center items-center gap-6">
      {/* Back button */}
      <div
        className="fixed top-5 left-5 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack className="w-12 h-12 text-gray-600" />
      </div>

      {/* Profile Image */}
      <div
        className="rounded-full bg-white border-4 border-[#20c7ff] shadow-lg relative cursor-pointer"
        onClick={() => imageRef.current.click()}
      >
        <div className="w-[200px] h-[200px] rounded-full overflow-hidden">
          <img
            src={frontendImage}
            alt="profile"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute bottom-4 right-4 w-[36px] h-[36px] rounded-full bg-[#20c7ff] flex items-center justify-center shadow-lg">
          <IoCameraOutline className="text-white w-5 h-5" />
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleProfile}
        className="w-[90%] max-w-[500px] flex flex-col gap-4 items-center"
      >
        <input
          type="file"
          accept="image/*"
          ref={imageRef}
          hidden
          onChange={handleImage}
        />

        {/* Full Name */}
        <input
          type="text"
          placeholder="Enter your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full h-[50px] border-2 border-[#20c7ff] px-5 rounded-lg text-gray-700 text-[18px]"
          required
        />

        {/* Email (readonly) */}
        <input
          type="email"
          readOnly
          value={userData?.email}
          className="w-full h-[50px] border-2 border-[#20c7ff] px-5 rounded-lg text-gray-400 bg-gray-100 text-[18px]"
        />

        <button
          disabled={saving}
          className="px-6 py-3 bg-[#20c7ff] rounded-2xl shadow-lg text-[18px] font-semibold hover:shadow-inner disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}

export default Profile;
