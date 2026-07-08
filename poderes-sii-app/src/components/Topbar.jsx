import { Link } from 'react-router-dom';

export default function Topbar({ crumbs }) {
  return (
    <div className="topbar">
      <div className="breadcrumb">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i}>
              {isLast || !c.to ? (
                <b>{c.label}</b>
              ) : (
                <Link className="crumb-link" to={c.to}>{c.label}</Link>
              )}
              {!isLast && <span> / </span>}
            </span>
          );
        })}
      </div>
      <div className="user-chip">
        <div className="user-avatar">CC</div>
        <span>Usuario Demo · Sur Consulting</span>
      </div>
    </div>
  );
}
