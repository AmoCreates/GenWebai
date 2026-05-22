import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import useGetCurrentUser from './hooks/useGetCurrentUser.jsx'
import { useSelector } from 'react-redux'
import Generate from './pages/Generate.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Notfound from './pages/Notfound.jsx'
import WebsiteEditor from './pages/Editor.jsx'
import Live from './pages/Live.jsx'
import Pricing from './pages/Pricing.jsx'

const App = () => {
  useGetCurrentUser();
  const {userData} = useSelector(state => state.user);

  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/dashboard' element={userData? <Dashboard/> : <Home/>}/>
      <Route path='/generate' element={userData? <Generate/> : <Home/>}/>
      <Route path='/editor/:id' element={userData? <WebsiteEditor/> : <Home/>}/>
      <Route path='/site/:id' element={<Live/>}/>
      <Route path='/pricing' element={userData? <Pricing/> : <Home/>}/>
      <Route path='*' element={<Notfound/>}/>
    </Routes>
  )
}

export default App