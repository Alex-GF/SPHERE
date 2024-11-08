import { Container } from '@mui/material';
import { flex } from '../../../core/theme/css';
import Logo from '../../../core/components/logo';

export default function HomePage() {
  return (
    <Container
      sx={{
        ...flex({ direction: 'column' }),
      }}
    >
      <Logo />
      Welcome To MASSP
    </Container>
  );
}
