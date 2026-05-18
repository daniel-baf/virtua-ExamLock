import styles from '@monitoring/components/MessageDialog.module.css';

export default function MessageDialog({ text, onTextChange, onCancel, onSend }) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        <h3>Enviar mensaje</h3>
        <textarea
          value={text}
          onChange={e => onTextChange(e.target.value)}
          rows={3}
          placeholder="Mensaje para el alumno..."
          autoFocus
          className={styles.textarea}
        />
        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.actionButton}>Cancelar</button>
          <button onClick={onSend} className={`${styles.actionButton} ${styles.infoButton}`}>Enviar</button>
        </div>
      </div>
    </div>
  );
}
