export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface DnsRecord {
  type: string
  value: string
  ttl?: number
  priority?: number
}

export interface WhoisResult {
  domain: string
  registrar?: string
  registrarUrl?: string
  createdDate?: string
  updatedDate?: string
  expiresDate?: string
  status?: string[]
  nameServers?: string[]
  raw?: string
}

export interface SslCertificate {
  subject: {
    CN?: string
    O?: string
  }
  issuer: {
    CN?: string
    O?: string
  }
  validFrom: string
  validTo: string
  daysRemaining: number
  isValid: boolean
  isTrusted: boolean
  protocol: string
  cipher: string
  san: string[]
  serialNumber: string
  fingerprint: string
}

export interface PingResult {
  host: string
  ip?: string
  latencyMs: number[]
  min: number
  max: number
  avg: number
  packetLoss: number
}

export interface TracerouteHop {
  hop: number
  ip: string
  hostname?: string
  latencyMs: number
  location?: string
}

export interface PortResult {
  port: number
  service: string
  isOpen: boolean
  latencyMs?: number
}

export interface IpGeoResult {
  ip: string
  hostname?: string
  city?: string
  region?: string
  country?: string
  countryCode?: string
  lat?: number
  lon?: number
  timezone?: string
  isp?: string
  org?: string
  asn?: string
}

export interface HttpHeader {
  name: string
  value: string
  description?: string
  securityNote?: string
  grade?: 'good' | 'warning' | 'danger' | 'info'
}

export interface RedirectHop {
  url: string
  statusCode: number
  statusText: string
  location?: string
  responseTimeMs: number
  headers?: Record<string, string>
}

export interface SecurityCheckItem {
  id: string
  label: string
  status: 'pass' | 'warn' | 'fail' | 'info'
  message: string
  detail?: string
  points: number
  maxPoints: number
}

export interface SecurityScanResult {
  domain: string
  score: number
  maxScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  checks: SecurityCheckItem[]
}

export interface CidrResult {
  cidr: string
  networkAddress: string
  broadcastAddress: string
  netmask: string
  wildcardMask: string
  firstUsable: string
  lastUsable: string
  totalHosts: number
  usableHosts: number
  ipVersion: 4 | 6
}

export interface SubnetResult {
  parentCidr: string
  subnets: CidrResult[]
  newPrefix: number
}
