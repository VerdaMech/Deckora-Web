import { OverlayTrigger, Tooltip as BSTooltip } from 'react-bootstrap';

/**
 * @param {{ content: string, placement?: 'top'|'bottom'|'left'|'right', children: React.ReactNode }} props
 */
export default function Tooltip({ content, placement = 'top', children }) {
  return (
    <OverlayTrigger
      placement={placement}
      overlay={
        <BSTooltip className="tooltip-deckora">
          {content}
        </BSTooltip>
      }
    >
      <span>{children}</span>
    </OverlayTrigger>
  );
}
