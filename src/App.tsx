import { RouterProvider } from 'react-router';
import { router } from './utils/routes';
import { SearchProvider } from './contexts/SearchContext';
import './index.css';

function App() {
  return (
    <SearchProvider>
      <RouterProvider router={router} />
    </SearchProvider>
  );
}

export default App;
