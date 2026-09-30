import {
  Search, RotateCcw, FileText, Mail, Globe, ShieldCheck, Key, Lock,
  Activity, MapPin, Wifi, Server, Radio, Link, AlignJustify, Shield,
  Calculator, Network, Building2, ArrowRightLeft
} from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

export type ToolCategory =
  | 'dns-domain'
  | 'network'
  | 'http-web'
  | 'security'
  | 'calculators'
  | 'discovery'

export interface ToolDefinition {
  slug: string
  name: string
  description: string
  category: ToolCategory
  icon: LucideIcon
  accentColor: string // Tailwind text color class
  inputType: 'domain' | 'ip' | 'url' | 'cidr' | 'custom'
  inputPlaceholder: string
  apiEndpoint: string
  badge?: string // optional extra badge text
}

export const CATEGORIES: Record<ToolCategory, { label: string; description: string }> = {
  'dns-domain': { label: 'DNS & Domain', description: 'Dig into DNS records, WHOIS data, and email security' },
  'network': { label: 'Network', description: 'Diagnose connectivity, latency, and routing' },
  'http-web': { label: 'HTTP & Web', description: 'Inspect HTTP responses, headers, and redirects' },
  'security': { label: 'Security', description: 'Audit SSL certificates and domain security posture' },
  'calculators': { label: 'Calculators', description: 'Calculate CIDR ranges and subnet configurations' },
  'discovery': { label: 'Discovery', description: 'Understand your own network infrastructure' },
}

export const TOOLS: ToolDefinition[] = [
  // --- DNS & Domain ---
  {
    slug: 'dns-lookup',
    name: 'DNS Lookup',
    description: 'Query A, AAAA, CNAME, MX, TXT, NS, SOA records for any domain',
    category: 'dns-domain',
    icon: Search,
    accentColor: 'text-blue-500',
    inputType: 'domain',
    inputPlaceholder: 'example.com',
    apiEndpoint: '/api/tools/dns-lookup',
  },
  {
    slug: 'reverse-dns',
    name: 'Reverse DNS',
    description: 'Resolve an IP address back to its hostname (PTR record)',
    category: 'dns-domain',
    icon: RotateCcw,
    accentColor: 'text-violet-500',
    inputType: 'ip',
    inputPlaceholder: '8.8.8.8',
    apiEndpoint: '/api/tools/reverse-dns',
  },
  {
    slug: 'whois',
    name: 'WHOIS Lookup',
    description: 'Get domain registration, expiry, registrar, and nameserver details',
    category: 'dns-domain',
    icon: FileText,
    accentColor: 'text-amber-500',
    inputType: 'domain',
    inputPlaceholder: 'example.com',
    apiEndpoint: '/api/tools/whois',
  },
  {
    slug: 'mx-lookup',
    name: 'MX Lookup',
    description: 'List mail exchange records with priority for a domain',
    category: 'dns-domain',
    icon: Mail,
    accentColor: 'text-pink-500',
    inputType: 'domain',
    inputPlaceholder: 'example.com',
    apiEndpoint: '/api/tools/mx-lookup',
  },
  {
    slug: 'dns-propagation',
    name: 'DNS Propagation',
    description: 'Check DNS record propagation across multiple global resolvers',
    category: 'dns-domain',
    icon: Globe,
    accentColor: 'text-teal-500',
    inputType: 'domain',
    inputPlaceholder: 'example.com',
    apiEndpoint: '/api/tools/dns-propagation',
  },
  {
    slug: 'spf-checker',
    name: 'SPF Checker',
    description: 'Parse and validate SPF records to prevent email spoofing',
    category: 'dns-domain',
    icon: ShieldCheck,
    accentColor: 'text-green-500',
    inputType: 'domain',
    inputPlaceholder: 'example.com',
    apiEndpoint: '/api/tools/spf-checker',
  },
  {
    slug: 'dkim-checker',
    name: 'DKIM Checker',
    description: 'Verify DKIM public key records for a domain and selector',
    category: 'dns-domain',
    icon: Key,
    accentColor: 'text-indigo-500',
    inputType: 'custom',
    inputPlaceholder: 'example.com',
    apiEndpoint: '/api/tools/dkim-checker',
  },
  {
    slug: 'dmarc-checker',
    name: 'DMARC Checker',
    description: 'Parse and validate DMARC policy for a domain',
    category: 'dns-domain',
    icon: Lock,
    accentColor: 'text-red-500',
    inputType: 'domain',
    inputPlaceholder: 'example.com',
    apiEndpoint: '/api/tools/dmarc-checker',
  },
  // --- Network ---
  {
    slug: 'ping',
    name: 'Ping',
    description: 'Measure TCP round-trip latency to any host or IP address',
    category: 'network',
    icon: Activity,
    accentColor: 'text-cyan-500',
    inputType: 'domain',
    inputPlaceholder: 'example.com or 8.8.8.8',
    apiEndpoint: '/api/tools/ping',
  },
  {
    slug: 'traceroute',
    name: 'Traceroute',
    description: 'Trace the network path and latency to a destination hop by hop',
    category: 'network',
    icon: MapPin,
    accentColor: 'text-orange-500',
    inputType: 'domain',
    inputPlaceholder: 'example.com or 8.8.8.8',
    apiEndpoint: '/api/tools/traceroute',
  },
  {
    slug: 'port-checker',
    name: 'Port Checker',
    description: 'Test if TCP ports are open or closed on any host',
    category: 'network',
    icon: Wifi,
    accentColor: 'text-emerald-500',
    inputType: 'domain',
    inputPlaceholder: 'example.com or 8.8.8.8',
    apiEndpoint: '/api/tools/port-checker',
  },
  {
    slug: 'ip-geolocation',
    name: 'IP Geolocation',
    description: 'Locate any IP address with city, country, ISP, and coordinates',
    category: 'network',
    icon: Server,
    accentColor: 'text-sky-500',
    inputType: 'ip',
    inputPlaceholder: '8.8.8.8',
    apiEndpoint: '/api/tools/ip-geolocation',
  },
  {
    slug: 'asn-lookup',
    name: 'ASN Lookup',
    description: 'Look up Autonomous System Number details for an IP or ASN',
    category: 'network',
    icon: Radio,
    accentColor: 'text-purple-500',
    inputType: 'ip',
    inputPlaceholder: '8.8.8.8 or AS15169',
    apiEndpoint: '/api/tools/asn-lookup',
  },
  // --- HTTP & Web ---
  {
    slug: 'http-status',
    name: 'HTTP Status',
    description: 'Check the HTTP response status code for any URL',
    category: 'http-web',
    icon: Link,
    accentColor: 'text-blue-400',
    inputType: 'url',
    inputPlaceholder: 'https://example.com',
    apiEndpoint: '/api/tools/http-status',
  },
  {
    slug: 'http-headers',
    name: 'HTTP Headers',
    description: 'Inspect all response headers with explanations and security grades',
    category: 'http-web',
    icon: AlignJustify,
    accentColor: 'text-violet-400',
    inputType: 'url',
    inputPlaceholder: 'https://example.com',
    apiEndpoint: '/api/tools/http-headers',
  },
  {
    slug: 'http-redirects',
    name: 'Redirect Visualizer',
    description: 'Trace the complete redirect chain from start to final destination',
    category: 'http-web',
    icon: ArrowRightLeft,
    accentColor: 'text-amber-400',
    inputType: 'url',
    inputPlaceholder: 'http://example.com',
    apiEndpoint: '/api/tools/http-redirects',
  },
  // --- Security ---
  {
    slug: 'ssl-checker',
    name: 'SSL Checker',
    description: 'Inspect SSL/TLS certificate details, chain, expiry, and cipher',
    category: 'security',
    icon: Lock,
    accentColor: 'text-green-400',
    inputType: 'domain',
    inputPlaceholder: 'example.com',
    apiEndpoint: '/api/tools/ssl-checker',
  },
  {
    slug: 'domain-security',
    name: 'Domain Security Scanner',
    description: 'Full security audit: DNS, SSL, headers, SPF/DKIM/DMARC, ports, risk score',
    category: 'security',
    icon: Shield,
    accentColor: 'text-red-400',
    inputType: 'domain',
    inputPlaceholder: 'example.com',
    apiEndpoint: '/api/tools/domain-security',
    badge: 'Pro',
  },
  // --- Calculators ---
  {
    slug: 'cidr-calculator',
    name: 'CIDR Calculator',
    description: 'Convert CIDR notation to IP range, netmask, and broadcast address',
    category: 'calculators',
    icon: Calculator,
    accentColor: 'text-teal-400',
    inputType: 'cidr',
    inputPlaceholder: '192.168.1.0/24',
    apiEndpoint: '/api/tools/cidr-calculator',
  },
  {
    slug: 'subnet-calculator',
    name: 'Subnet Calculator',
    description: 'Divide networks into subnets and calculate host ranges',
    category: 'calculators',
    icon: Network,
    accentColor: 'text-cyan-400',
    inputType: 'cidr',
    inputPlaceholder: '10.0.0.0/8',
    apiEndpoint: '/api/tools/subnet-calculator',
  },
  // --- Discovery ---
  {
    slug: 'my-infrastructure',
    name: 'What Is My Infrastructure?',
    description: 'Auto-detect your public IP, DNS, ISP, geolocation, and headers',
    category: 'discovery',
    icon: Building2,
    accentColor: 'text-blue-500',
    inputType: 'custom',
    inputPlaceholder: '',
    apiEndpoint: '/api/tools/my-infrastructure',
  },
]

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.slug === slug)
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOLS.filter((t) => t.category === category)
}

export const CATEGORY_ORDER: ToolCategory[] = [
  'dns-domain', 'network', 'http-web', 'security', 'calculators', 'discovery'
]
