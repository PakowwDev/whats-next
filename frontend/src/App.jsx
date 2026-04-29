import { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('Chargement...');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Au démarrage du composant, on appelle le backend
    fetch('http://localhost:3000/api/hello')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setError('Impossible de joindre le backend : ' + err.message));
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
        What's Next?
      </h1>
      <div className="text-center">
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <p className="text-violet-300 text-lg">{message}</p>
        )}
      </div>
    </div>
  );
}

export default App;