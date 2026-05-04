/**
 * @param {{ icon?: React.ElementType, title: string, description?: string, action?: React.ReactNode }} props
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={48} className="empty-state__icon" />}
      <h3 className="empty-state__title font-h4">{title}</h3>
      {description && <p className="empty-state__desc font-body">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
