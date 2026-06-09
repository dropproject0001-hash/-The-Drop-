import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{color: 'red', backgroundColor: 'white', padding: '50px', fontSize: '40px', minHeight: '100vh'}}>
      DEBUG: MINIMAL REACT MOUNTED
    </div>
  </StrictMode>,
);
