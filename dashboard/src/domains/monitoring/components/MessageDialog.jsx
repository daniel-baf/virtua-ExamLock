export default function MessageDialog({ text, onTextChange, onCancel, onSend }) {
  return (
    <div className="modal-backdrop">
      <div className="message-dialog">
        <h3>Enviar mensaje</h3>
        <textarea
          value={text}
          onChange={e => onTextChange(e.target.value)}
          rows={3}
          placeholder="Mensaje para el alumno..."
          autoFocus
        />
        <div className="message-dialog__actions">
          <button onClick={onCancel} className="student-action">Cancelar</button>
          <button onClick={onSend} className="student-action student-action--info">Enviar</button>
        </div>
      </div>
    </div>
  );
}
