import { auth } from '@shared/lib/firebase';
import { Button, PageHeader } from '@shared/ui';
import styles from './AdminHeader.module.css';

export default function AdminHeader({ activeSection, loading, onRefresh }) {
  const email = auth.currentUser?.email ?? '';

  return (
    <PageHeader
      brandTitle="ExamLock"
      brandSubtitle="Administracion"
      actions={(
        <>
          <Button to="/admin/users" variant={activeSection === 'users' ? 'primary' : 'ghost'}>
            Usuarios
          </Button>
          <Button to="/admin/monitoring" variant={activeSection === 'monitoring' ? 'primary' : 'ghost'}>
            Monitoreo
          </Button>
          <span className={styles.email}>{email}</span>
          <Button onClick={onRefresh} disabled={loading} variant="ghost">
            {loading ? 'Cargando...' : 'Actualizar'}
          </Button>
          <Button onClick={() => auth.signOut()} variant="link">
            Cerrar sesion
          </Button>
        </>
      )}
    />
  );
}
