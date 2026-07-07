import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppSelector } from './useAuth';

interface LowStockPayload {
  productId: string;
  name: string;
  stock: number;
}

interface NewSalePayload {
  saleId: string;
  grandTotal: number;
  customer: string;
}

// Derive the socket base URL from the API base URL (strip the /api/v1 suffix)
const SOCKET_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(
  /\/api\/v1\/?$/,
  ''
);

/**
 * Bonus: connects to the backend's Socket.io "management-room" (Admin/Manager only)
 * and shows a live toast + refreshes the relevant React Query caches whenever a
 * sale is created or a product's stock drops below its low-stock threshold.
 * Mount this once near the top of the authenticated app (DashboardLayout).
 */
export const useRealtimeNotifications = () => {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const qc = useQueryClient();

  useEffect(() => {
    if (!accessToken) return;

    const socket: Socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socket.on('connect_error', (err) => {
      // Non-fatal — e.g. Employee role isn't added to management-room, or the
      // token just isn't valid for sockets. The rest of the app keeps working.
      console.warn('Realtime connection unavailable:', err.message);
    });

    socket.on('low-stock-alert', (payload: LowStockPayload) => {
      toast.warning(`Low stock: ${payload.name} (${payload.stock} left)`);
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    });

    socket.on('new-sale', (payload: NewSalePayload) => {
      toast.success(`New sale: ৳${payload.grandTotal.toLocaleString()} — ${payload.customer}`);
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['sales'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, qc]);
};
