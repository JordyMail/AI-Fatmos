import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CheckIn from "./pages/CheckIn";
import CheckOut from "./pages/CheckOut";
import Dashboard from "./pages/Dashboard";
import Questionnaire from "./pages/Questionnaire";
import Reports from "./pages/Reports";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/checkin" element={<CheckIn />} />
        
        {/* Placeholder routes for future development */}
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/management" element={<Placeholder page="Management Dashboard" description="Unit overview, team trends, and collective alerts" />} />
        <Route path="/admin" element={<Placeholder page="Admin Panel" description="Device management, configuration, and system settings" />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
