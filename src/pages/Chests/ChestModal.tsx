import type { ReactNode } from "react";
import styles from "./Chests.module.css";

/**
 * @typedef {object} ChestModalProps
 * @property {boolean} isOpen - Управляет видимостью модального окна.
 * @property {() => void} onClose - Функция обратного вызова для закрытия окна.
 * @property {string} [title] - Необязательный заголовок модального окна.
 * @property {ReactNode} children - Содержимое модального окна.
 */
interface ChestModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * Компонент модального окна для страницы сундуков.
 * Отображает переданное содержимое в стилизованном окне поверх основного контента.
 * @param {ChestModalProps} props - Свойства компонента.
 * @returns {JSX.Element | null}
 */
const ChestModal = ({ isOpen, onClose, title, children }: ChestModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalWindow} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          {title && <h3>{title}</h3>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChestModal;
