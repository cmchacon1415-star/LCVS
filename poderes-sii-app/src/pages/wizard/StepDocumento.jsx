import { useState } from 'react';
import Combobox from '../../components/Combobox';
import Icon from '../../components/Icon';
import { COMUNAS } from '../../data/comunas';
import { MESES, fechaTextoFromISO, pad2 } from '../../utils/text';
import { useWizard } from './WizardContext';

const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);
const THIS_YEAR = new Date().getFullYear();
const ANIOS = Array.from({ length: 5 }, (_, i) => THIS_YEAR - 1 + i);

export default function StepDocumento() {
  const { wizard, update, attempted } = useWizard();
  const initial = wizard.fecha ? wizard.fecha.split('-').map(Number) : [null, null, null];
  const [year, setYear] = useState(initial[0]);
  const [month, setMonth] = useState(initial[1]);
  const [day, setDay] = useState(initial[2]);

  function apply(nextDay, nextMonth, nextYear) {
    setDay(nextDay);
    setMonth(nextMonth);
    setYear(nextYear);
    if (nextDay && nextMonth && nextYear) update({ fecha: `${nextYear}-${pad2(nextMonth)}-${pad2(nextDay)}` });
    else update({ fecha: '' });
  }

  return (
    <>
      <h3 style={{ marginTop: 0 }}>1. Datos del documento</h3>
      <div className="grid-2">
        <div className={`field${attempted && !wizard.ciudadFirma ? ' invalid' : ''}`}>
          <label className="field-label">Ciudad / comuna de firma *</label>
          <Combobox
            items={COMUNAS}
            getLabel={(c) => c.comuna}
            getSub={(c) => c.region}
            placeholder="Buscar comuna o ciudad..."
            initialLabel={wizard.ciudadFirma}
            onSelect={(c) => update({ ciudadFirma: c.comuna })}
          />
          <div className="field-hint">Buscador con el catálogo de comunas y ciudades de Chile.</div>
          <div className="field-error">Este campo es obligatorio.</div>
        </div>
        <div className={`field${attempted && !wizard.fecha ? ' invalid' : ''}`}>
          <label className="field-label">Fecha del documento *</label>
          <div className="row-3">
            <select value={day || ''} onChange={(e) => apply(Number(e.target.value) || null, month, year)}>
              <option value="">Día</option>
              {DIAS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <select value={month || ''} onChange={(e) => apply(day, Number(e.target.value) || null, year)}>
              <option value="">Mes</option>
              {MESES.map((mes, i) => <option key={mes} value={i + 1}>{mes.charAt(0).toUpperCase() + mes.slice(1)}</option>)}
            </select>
            <select value={year || ''} onChange={(e) => apply(day, month, Number(e.target.value) || null)}>
              <option value="">Año</option>
              {ANIOS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="field-error">Este campo es obligatorio.</div>
        </div>
      </div>
      {wizard.ciudadFirma && wizard.fecha && (
        <div className="banner banner-info">
          <Icon name="info" />
          <div>Se imprimirá como: <b>"En {wizard.ciudadFirma}, a {fechaTextoFromISO(wizard.fecha)}."</b></div>
        </div>
      )}
    </>
  );
}
