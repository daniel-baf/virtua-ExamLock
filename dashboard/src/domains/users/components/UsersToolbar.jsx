import Button from '@shared/ui/Button';
import PageSection from '@shared/ui/PageSection';

export default function UsersToolbar({ onCreate }) {
  return (
    <PageSection
      title="Usuarios"
      subtitle="Gestiona cuentas de administrador, profesor y alumno."
      actions={(
        <Button type="button" onClick={onCreate} variant="primary">
          Crear usuario
        </Button>
      )}
    />
  );
}
