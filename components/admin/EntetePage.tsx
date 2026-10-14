// En-tête de chaque page de l'admin : titre, phrase d'explication et actions principales.
export default function EntetePage({
  titre,
  children,
  actions,
}: {
  titre: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="entete-page">
      <div>
        <h1>{titre}</h1>
        {children && <p className="entete-page-texte">{children}</p>}
      </div>
      {actions && <div className="entete-page-actions">{actions}</div>}
    </div>
  );
}
