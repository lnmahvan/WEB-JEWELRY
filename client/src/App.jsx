import { useEffect, useRef, useState } from 'react'
import './App.css'
import { Route, Routes, useNavigate } from 'react-router'
import { RouterAccount } from './route/RouterAccount/RouterAccount'
import axiosClient from './service/axiosClient'
import { UserAuthStore } from './store/userAuthStore'
import { API_GOOGLE } from './api/api'
import { RouterAdmin } from './route/RouterAdmin/RouterAdmin'
import { Toaster } from 'sonner'
import { ArrowUp } from 'lucide-react'
import { commonStore } from './store/commonStore/commonStore'
import { ToastContainer } from 'react-toastify'


function App() {
  const [show, setShow] = useState(false)
  const { setValue } = commonStore()
  const navigate = useNavigate()
  const lastValue = useRef(null);
  const setAccessToken = UserAuthStore((s) => s.setAccessToken);
  const clearState = UserAuthStore((e) => e.clearState)
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await axiosClient.post("/api/refresh");
        setAccessToken(res.data.data.accessToken);
      } catch (err) {
        console.log("Không có refresh token hoặc đã hết hạn.");
        localStorage.removeItem("user");
        navigate("/login")
      }
    };
    refresh();
  }, [setAccessToken]);
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get("access_token");
    console.log(access_token)
    if (!access_token) return;
    const getUserInfo = async () => {
      try {
        const res = await axiosClient.post(API_GOOGLE, { access_token });
        console.log("userrrrrrrrr", res)
        if (res.status === 200) {
          setAccessToken(res.data.data.accessToken)
          localStorage.setItem("user", JSON.stringify(res.data.data.user));
        }
      } catch (error) {
        console.error("Lỗi đăng nhập Google:", error);
        localStorage.removeItem("user");
        navigate("/login")
      }
    }
    getUserInfo()
    window.history.replaceState(null, "", window.location.pathname);
  }, [])
  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
      const current =
        window.scrollY >= 1500 && window.scrollY <= 2300;

      if (current !== lastValue.current) {
        setValue(current);
        lastValue.current = current;
      }

      setShow(window.scrollY > 300);
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      <Toaster />
      <ToastContainer />
      <Routes>
        <Route path='/*' element={<RouterAccount />} />
        <Route path='/admin/*' element={<RouterAdmin />} />
      </Routes>
      <div className={`bg-secondary w-12.5 h-12.5 flex items-center justify-center rounded-full cursor-pointer text-white fixed right-12.5 z-99 bottom-5 ${show ? "opacity-100" : "opacity-0"} transition-all duration-300 ease-in-out z-50`} onClick={scrollToTop}>
        <ArrowUp size={30} />
      </div>
    </>
  )
}

export default App
