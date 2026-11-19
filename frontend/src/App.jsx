import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MediaDetail from './pages/MediaDetail';
import Profile from './pages/Profile';
import OnboardingGenres from './pages/OnboardingGenres';
import OnboardingPlatforms from './pages/OnboardingPlatforms';
import SearchResults from './pages/SearchResults';
import About from './pages/About';
import Legal from './pages/Legal';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding/genres" element={<OnboardingGenres />} />
      <Route path="/onboarding/platforms" element={<OnboardingPlatforms />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/media/:source/:type/:id" element={<MediaDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/a-propos" element={<About />} />
      <Route path="/mentions-legales" element={<Legal />} />
    </Routes>
  );
}

export default App;