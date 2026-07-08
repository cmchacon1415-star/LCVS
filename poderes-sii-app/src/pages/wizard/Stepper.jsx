import Icon from '../../components/Icon';
import { STEP_LABELS } from './WizardContext';

export default function Stepper({ step }) {
  return (
    <div className="stepper">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const cls = n < step ? 'done' : n === step ? 'active' : '';
        return (
          <div className={`stepper-item ${cls}`} key={label}>
            <div className="stepper-circle">{n < step ? <Icon name="check" /> : n}</div>
            <div className="stepper-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
