import { RouterProvider } from 'react-router';
import { router } from './utils/routes';
import { SearchProvider } from './contexts/SearchContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <SearchProvider>
        <RouterProvider router={router} />
      </SearchProvider>
    </ThemeProvider>
  );
}

export default App;
