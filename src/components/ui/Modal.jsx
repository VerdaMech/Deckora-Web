import { Modal as BSModal } from 'react-bootstrap';
import { X } from 'lucide-react';

const SIZE_MAP = { sm: 'sm', md: undefined, lg: 'lg', xl: 'xl' };

/**
 * @param {{ show: boolean, onHide: () => void, title: string, size?: 'sm'|'md'|'lg'|'xl', footer?: React.ReactNode, children: React.ReactNode }} props
 */
export default function Modal({ show, onHide, title, size = 'md', footer, children }) {
  return (
    <BSModal
      show={show}
      onHide={onHide}
      size={SIZE_MAP[size]}
      centered
      className="deckora-modal"
    >
      <BSModal.Header className="modal-header-custom">
        <BSModal.Title className="modal-title-custom">{title}</BSModal.Title>
        <button className="modal-close-btn" onClick={onHide} aria-label="Cerrar">
          <X size={18} />
        </button>
      </BSModal.Header>
      <BSModal.Body className="modal-body-custom">{children}</BSModal.Body>
      {footer && (
        <BSModal.Footer className="modal-footer-custom">{footer}</BSModal.Footer>
      )}
    </BSModal>
  );
}
