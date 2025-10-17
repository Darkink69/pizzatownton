import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Bank from "./pages/Bank";
import Friends from "./pages/Friends";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/bank" element={<Bank />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
