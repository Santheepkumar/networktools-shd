import { z } from 'zod'

export const domainSchema = z.string()
  .min(1, 'Domain is required')
  .max(253, 'Domain is too long')
  .regex(
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    'Enter a valid domain name (e.g. example.com)'
  )

export const ipv4Schema = z.string()
  .regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    'Enter a valid IPv4 address (e.g. 8.8.8.8)'
  )

export const ipv6Schema = z.string()
  .regex(
    /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^[0-9a-fA-F]{1,4}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){2}:(?:[0-9a-fA-F]{1,4}:){0,4}[0-9a-fA-F]{1,4}$/,
    'Enter a valid IPv6 address'
  )

export const ipSchema = z.union([ipv4Schema, ipv6Schema])

export const hostSchema = z.union([domainSchema, ipv4Schema, ipv6Schema])

export const urlSchema = z.string()
  .url('Enter a valid URL (e.g. https://example.com)')

export const cidrv4Schema = z.string()
  .regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/,
    'Enter a valid CIDR (e.g. 192.168.1.0/24)'
  )

export const portSchema = z.number()
  .int()
  .min(1, 'Port must be between 1 and 65535')
  .max(65535, 'Port must be between 1 and 65535')

export const dnsRecordTypeSchema = z.enum(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'PTR', 'CAA', 'ANY'])

// DNS lookup schema
export const dnsLookupSchema = z.object({
  domain: domainSchema,
  recordType: dnsRecordTypeSchema.default('A'),
})

// Reverse DNS schema
export const reverseDnsSchema = z.object({
  ip: ipSchema,
})

// WHOIS schema
export const whoisSchema = z.object({
  domain: domainSchema,
})

// MX schema
export const mxLookupSchema = z.object({
  domain: domainSchema,
})

// SPF/DKIM/DMARC schemas
export const spfCheckerSchema = z.object({ domain: domainSchema })
export const dmarcCheckerSchema = z.object({ domain: domainSchema })
export const dkimCheckerSchema = z.object({
  domain: domainSchema,
  selector: z.string().min(1, 'Selector is required').default('default'),
})

// DNS propagation schema
export const dnsPropagationSchema = z.object({
  domain: domainSchema,
  recordType: dnsRecordTypeSchema.default('A'),
})

// Network schemas
export const pingSchema = z.object({ host: hostSchema })
export const tracerouteSchema = z.object({ host: hostSchema })
export const portCheckerSchema = z.object({
  host: hostSchema,
  ports: z.array(portSchema).optional(),
})
export const ipGeoSchema = z.object({ ip: ipSchema })
export const asnLookupSchema = z.object({
  query: z.string().min(1, 'Enter an IP address or ASN (e.g. AS15169)'),
})

// HTTP schemas
export const httpStatusSchema = z.object({ url: urlSchema })
export const httpHeadersSchema = z.object({ url: urlSchema })
export const httpRedirectsSchema = z.object({ url: urlSchema })

// SSL schema
export const sslCheckerSchema = z.object({ domain: domainSchema })

// Domain security scanner schema
export const domainSecuritySchema = z.object({ domain: domainSchema })

// Calculator schemas
export const cidrCalculatorSchema = z.object({ cidr: cidrv4Schema })
export const subnetCalculatorSchema = z.object({
  cidr: cidrv4Schema,
  newPrefix: z.number().int().min(1).max(30),
})
