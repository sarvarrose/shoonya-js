import { SHA256 } from 'jshashes'

/**
 * Hashes a string using SHA256
 */
const sha256 = (data: string): string => {
  const hash = new SHA256()
  return hash.hex(data)
}

export default sha256
