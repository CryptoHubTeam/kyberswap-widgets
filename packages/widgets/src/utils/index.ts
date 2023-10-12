import { getAddress } from 'ethers/lib/utils'
import { NATIVE_TOKEN_ADDRESS, WRAPPED_NATIVE_TOKEN } from '../constants'
import { BigNumber } from 'ethers'

export enum GroupingShortNumber {
  DOTS,
  NUMBERS,
}

export enum CompactNumber {
  SHORT,
  LONG,
}

const GroupingNumbers: Record<number, string> = {
  0: '₀',
  1: '₁',
  2: '₂',
  3: '₃',
  4: '₄',
  5: '₅',
  6: '₆',
  7: '₇',
  8: '₈',
  9: '₉',
}

const SiPrefixes = {
  [CompactNumber.SHORT]: ['', 'K', 'M', 'B', 't', 'q', 'Q', 's', 'S', 'o', 'n', 'd', 'U', 'D', 'T'],
  [CompactNumber.LONG]: [
    '',
    'Thousand',
    'Million',
    'Billion',
    'Trillion',
    'Quadrillion',
    'Quintillion',
    'Sextillion',
    'Septillion',
    'Octillion',
    'Nonillion',
    'Decillion',
    'Undecillion',
    'Duodecillion',
    'Tredecillion',
  ].map(n => ` ${n}`),
}

const defaultConfig = {
  maxZeros: 4,
  minTrailing: 2,
  maxTrailing: 4,
  optimalLength: 6,
  expanded: false,
  roundIntegers: false,
  compact: CompactNumber.SHORT,
  group: GroupingShortNumber.NUMBERS,
  formatters: {
    grouping: numberGrouping,
  },
}

function isValidToFormat(number: number) {
  if (number + '' === '0') {
    return { isValid: false, ret: '0' }
  }

  if (!number || !number.toString().trim() || isNaN(number)) {
    return { isValid: false, ret: '' }
  }

  return { isValid: true }
}

function numberGrouping(zeros: number, group: GroupingShortNumber) {
  if (group === GroupingShortNumber.DOTS) {
    return '...0'
  }

  const zeroLen: any = zeros.toString().split('')

  return zeroLen.map((index: string) => GroupingNumbers[+index]).join('')
}

function abbreviateNumber(value: number, format: CompactNumber) {
  if (value === 0) {
    return '0'
  }

  const b = value.toPrecision(2).split('e')
  const k = b.length === 1 ? 0 : Math.floor(Math.min(+b[1].slice(1), 44) / 3)
  const c = +(k < 1 ? value.toFixed(2) : (value / Math.pow(10, k * 3)).toFixed(2))
  const d = c < 0 ? c : Math.abs(c)
  const e = d + SiPrefixes[format][k]

  return e.trim()
}

function exponentialToNumber(num: number | string | BigNumber) {
  const n = num === typeof BigNumber ? num.toString() : num
  const sign = +n < 0 ? '-' : ''

  if (!n.toString().includes('e')) {
    return n
  }

  const [lead, decimal, pow] = n
    .toString()
    .replace(/^-/, '')
    .replace(/^([0-9]+)(e.*)/, '$1.$2')
    .split(/e|\./)

  return +pow < 0
    ? `${sign}0.${'0'.repeat(Math.max(Math.abs(+pow) - 1 || 0, 0)) + lead + decimal}`
    : sign +
        lead +
        (+pow >= decimal.length
          ? decimal + '0'.repeat(Math.max(+pow - decimal.length || 0, 0))
          : `${decimal.slice(0, +pow)}.${decimal.slice(+pow)}`)
}

function numberToStringFormat(number: number) {
  if (/e/.test(number.toString())) {
    return exponentialToNumber(number).toString()
  }

  return number.toString()
}

export function formatNumber(number: number, options = {}) {
  const conf = { ...defaultConfig, ...options }
  const { isValid, ret } = isValidToFormat(number)

  if (!isValid) {
    return ret
  }

  const isVeryLarge = number >= 1_000_000_000

  if (isVeryLarge && !conf.expanded) {
    return abbreviateNumber(+number, conf.compact)
  }

  const stringFormat = numberToStringFormat(number)

  const [$, sign = '', integer, zeros = '', rest = ''] = stringFormat.match(
    /^(\-)?([^\.]+)(?:\.(0*)?(\d*))?/,
  ) as string[]
  const decimals = rest.substring(0, conf.maxTrailing)
  const optimalTrailing = Math.max(0, conf.optimalLength - integer.length)
  const minTrailing = Math.min(optimalTrailing, conf.minTrailing)
  const maxTrailing = Math.min(optimalTrailing, conf.maxTrailing)
  const isInteger = number % 1 === 0

  if (Math.abs(number) >= 1.0) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: conf.roundIntegers && isInteger ? 0 : Math.min(minTrailing, maxTrailing),
      maximumFractionDigits: conf.roundIntegers && isInteger ? 0 : maxTrailing,
    }).format(number)
  }

  if (!conf.expanded && zeros.length > conf.maxZeros) {
    const valueDecimal = conf.formatters.grouping(zeros.length, conf.group)

    return `${sign}0.0${valueDecimal}${decimals}`
  }

  return `${integer}.${zeros}${decimals.padEnd(maxTrailing, '0')}`
}

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: string): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

export function copyToClipboard(textToCopy: string) {
  // navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard api method'
    return navigator.clipboard.writeText(textToCopy)
  } else {
    // text area method
    const textArea = document.createElement('textarea')
    textArea.value = textToCopy
    // make the textarea out of viewport
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    return new Promise((res, rej) => {
      // here the magic happens
      document.execCommand('copy') ? res(textToCopy) : rej()
      textArea.remove()
    })
  }
}

const isNative = (chainId: number, address: string) => {
  if (address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) return true
  if (address.toLowerCase() === WRAPPED_NATIVE_TOKEN[chainId].address?.toLowerCase()) return true
  return false
}

export function isSameTokenAddress(
  chainId: number,
  tokenAAddress: string | undefined,
  tokenBAddress: string | undefined,
): boolean {
  if (!tokenAAddress) return false
  if (!tokenBAddress) return false
  if (isNative(chainId, tokenAAddress) && isNative(chainId, tokenBAddress)) return true

  return tokenAAddress.toLowerCase() === tokenBAddress.toLowerCase()
}
