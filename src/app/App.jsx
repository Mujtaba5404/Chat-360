import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { RouterProvider } from 'react-router/dom';
import { cssVariablesResolver, theme } from '../theme/theme';
import { zIndex } from '../theme/tokens';
import { router } from './routes';

export default function App() {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} defaultColorScheme="auto">
      <Notifications position="bottom-right" limit={3} zIndex={zIndex.toast} autoClose={3500} />
      <RouterProvider router={router} />
    </MantineProvider>
  );
}
