import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { DemoFooter } from "./components/DemoFooter";
import { StepperProvider } from "./lib/StepperContext";
import { LandingPage } from "./LandingPage";
import { EventHistorySlide } from "./EventHistory";
import { ActivityRetriesSlide } from "./ActivityRetries";
import { SignalsDemoSlide } from "./SignalsDemo";
import { TimersDemoSlide } from "./TimersDemo";
import { ClosingPage } from "./ClosingPage";

function AppContent() {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";
  const isClosing = pathname === "/get-started";
  const showChrome = !isLanding && !isClosing;

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {!isLanding && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/crash-recovery" element={<EventHistorySlide />} />
        <Route path="/activity-retries" element={<ActivityRetriesSlide />} />
        <Route path="/signals" element={<SignalsDemoSlide />} />
        <Route path="/timers" element={<TimersDemoSlide />} />
        <Route path="/get-started" element={<ClosingPage />} />
      </Routes>
      {showChrome && <DemoFooter />}
    </div>
  );
}

function App() {
  return (
    <StepperProvider>
      <AppContent />
    </StepperProvider>
  );
}

export default App;
