import Sidebar from '@/components/Sidebar';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </div>
      <Toaster position="bottom-left" />
    </div>
  );
}
