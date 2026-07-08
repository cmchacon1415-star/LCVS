import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PoderesStoreProvider } from './store/PoderesStoreContext';
import { ToastProvider } from './components/ToastContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Placeholder from './pages/Placeholder';
import GestionDocumental from './pages/GestionDocumental';
import PoderesSiiHome from './pages/PoderesSiiHome';
import PoderesGenerados from './pages/PoderesGenerados';
import GenerarPoderWizard from './pages/wizard/GenerarPoderWizard';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <PoderesStoreProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="adp" element={<Placeholder title="Personas (ADP)" />} />
              <Route path="remuneraciones" element={<Placeholder title="Remuneraciones" />} />
              <Route path="reportes" element={<Placeholder title="Reportes" />} />
              <Route path="config" element={<Placeholder title="Configuración" />} />
              <Route path="gestion-documental" element={<GestionDocumental />} />
              <Route path="gestion-documental/poderes-sii" element={<PoderesSiiHome />} />
              <Route path="gestion-documental/poderes-sii/generar" element={<GenerarPoderWizard />} />
              <Route path="gestion-documental/poderes-sii/generados" element={<PoderesGenerados />} />
            </Route>
          </Routes>
        </PoderesStoreProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
