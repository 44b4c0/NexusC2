import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

/* Pages */
import Login from "./pages/Login.tsx"
import Register from "./pages/Register.tsx"
import Thanks from "./pages/Thanks.tsx"
import Home from "./pages/Home.tsx"
import UserPage from "./pages/UserPage.tsx"
import Settings from "./pages/Settings.tsx"
import Me from "./pages/Me.tsx"
import BotTerminal from "./pages/BotTerminal.tsx"
import ChangeAdminPassword from "./pages/ChangeAdminPassword.tsx"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/thanks" element={<Thanks />} />

        <Route path="/home" element={<Home />} />
        <Route path="/user/:Username" element={<UserPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/me" element={<Me />}/>
        <Route path="/terminal/:roomId" element={<BotTerminal />}/>
        <Route path="/changeadminpassword" element={<ChangeAdminPassword />} />
      </Routes>
    </Router>
  )
}

export default App