import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  backTo?: string;
  action?: React.ReactNode;
  showBack?: boolean;
}

export function Header({ title, backTo, action, showBack = true }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      {showBack && (
        <button className="icon-button back-button" type="button" onClick={() => (backTo ? navigate(backTo) : navigate(-1))} aria-label="戻る">
          ＜
        </button>
      )}
      <Link className="brand" to="/">
        {title}
      </Link>
      <div className="header-action">{action}</div>
    </header>
  );
}
