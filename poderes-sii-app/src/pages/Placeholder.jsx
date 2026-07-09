import Icon from '../components/Icon';

export default function Placeholder({ title }) {
  return (
    <>
      <h1 className="page-title">{title}</h1>
      <div className="card">
        <div className="empty-state">
          <Icon name="info" />
          <p>Este módulo corresponde a la plataforma actual y no forma parte de este prototipo.</p>
        </div>
      </div>
    </>
  );
}
