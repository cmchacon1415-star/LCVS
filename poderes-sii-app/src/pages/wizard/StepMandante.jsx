import { useWizard } from './WizardContext';

export default function StepMandante() {
  const { wizard, update, attempted } = useWizard();
  return (
    <>
      <h3 style={{ marginTop: 0 }}>2. Tipo de mandante</h3>
      <div className="option-cards">
        <button
          type="button"
          className={`option-card${wizard.tipoMandante === 'juridica' ? ' selected' : ''}`}
          onClick={() => update({ tipoMandante: 'juridica' })}
        >
          <h4>Persona jurídica / empresa</h4>
          <p>La empresa comparece representada legalmente por una o más personas naturales.</p>
        </button>
        <button
          type="button"
          className={`option-card${wizard.tipoMandante === 'natural' ? ' selected' : ''}`}
          onClick={() => update({ tipoMandante: 'natural' })}
        >
          <h4>Persona natural</h4>
          <p>Se selecciona un cliente y, desde sus representantes, se elige a la persona natural mandante.</p>
        </button>
      </div>
      {attempted && !wizard.tipoMandante && (
        <div className="field-error" style={{ display: 'block', marginTop: 8 }}>Debes seleccionar un tipo de mandante.</div>
      )}
    </>
  );
}
