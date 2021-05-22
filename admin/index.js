import QRCodes from './pages/qrCodes';

export default {
  pages: () => [
    {
      label: 'Generer les QR codes',
      path: 'qr-codes',
      component: QRCodes,
    },
    {
      label: 'Utilisateurs',
      children: [{ listKey: 'User' }],
    },

    {
      label: 'Commandes',
      children: ['Order'],
    },
    {
      label: 'Configuration manager',
      children: ['Table', 'Menu', 'Article'],
    },
    {
      label: 'Configuration admin',
      children: ['Business'],
    },
  ],
};
