// src/models/tunnel.ts
export type TunnelStatus = 'active' | 'inactive' | 'error';
export type TunnelProtocol = 'http' | 'tcp';

export interface Tunnel {
  id: string;
  userId: string;
  subdomain: string;
  publicUrl: string;
  customDomain?: string;
  localPort: number;
  serverPort: number;
  protocol: TunnelProtocol;
  status: TunnelStatus;
  pid: number | null;
  createdAt: string;
  chiselCommand: string;
}
