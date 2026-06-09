interface GenerateFileURLArgs {
  filename: string
  prefix?: string | undefined
}

export function generateFileURL({ filename, prefix }: GenerateFileURLArgs): string {
  const cloudfront = process.env['CLOUDFRONT_URL'] ?? 'https://cdn.treasuretrove.in'
  const filePath = [prefix, filename].filter(Boolean).join('/')
  return `${cloudfront}/${filePath}`
}
