import { StrictMode, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { defaultTheme, Theme } from '../../theme'
import { ReactComponent as WalletIcon } from '../../assets/wallet.svg'
import { ReactComponent as DropdownIcon } from '../../assets/dropdown.svg'
import { ReactComponent as SwitchIcon } from '../../assets/switch.svg'
import { ReactComponent as SwapIcon } from '../../assets/swap.svg'
import { ReactComponent as BackIcon } from '../../assets/back1.svg'
import { ReactComponent as KyberSwapLogo } from '../../assets/kyberswap.svg'
import { ReactComponent as AlertIcon } from '../../assets/alert.svg'

import useTheme from '../../hooks/useTheme'

import {
  AccountBalance,
  BalanceRow,
  Input,
  InputRow,
  InputWrapper,
  MaxHalfBtn,
  MiddleRow,
  SelectTokenBtn,
  SettingBtn,
  SwitchBtn,
  Title,
  Wrapper,
  Button,
  Dots,
  Rate,
  MiddleLeft,
  Detail,
  DetailTitle,
  Divider,
  DetailRow,
  DetailLabel,
  DetailRight,
  ModalHeader,
  ModalTitle,
} from './styled'

import { BigNumber } from 'ethers'
import { NATIVE_TOKEN, NATIVE_TOKEN_ADDRESS, SUPPORTED_NETWORKS, TokenInfo, ZIndex } from '../../constants'
import SelectCurrency from '../SelectCurrency'
import { useActiveWeb3, Web3Provider } from '../../hooks/useWeb3Provider'
import useSwap from '../../hooks/useSwap'
import useTokenBalances from '../../hooks/useTokenBalances'
import { formatUnits } from 'ethers/lib/utils'
import useApproval, { APPROVAL_STATE } from '../../hooks/useApproval'
import { TokenListProvider, useTokens } from '../../hooks/useTokens'
import RefreshBtn from '../RefreshBtn'
import Confirmation from '../Confirmation'
import DexesSetting from '../DexesSetting'
import ImportModal from '../ImportModal'
import InfoHelper from '../InfoHelper'
import { formatNumber } from '../../utils'

export const DialogWrapper = styled.div`
  background-color: ${({ theme }) => theme.dialog};
  border-radius: ${({ theme }) => theme.borderRadius};
  position: absolute;
  left: 0;
  top: 0;
  width: calc(100%);
  height: calc(100%);
  padding: 1rem;
  overflow: hidden;
  z-index: ${ZIndex.DIALOG};
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @supports (overflow: clip) {
    overflow: clip;
  }

  transition: 0.25s ease-in-out;

  &.open {
    transform: translateX(0);
  }

  &.close {
    transform: translateX(100%);
  }
`

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    display: none;
  }
`

const SelectTokenText = styled.span`
  font-size: 16px;
  width: max-content;
`

const PoweredBy = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: ${({ theme }) => theme.subText};
  font-size: 14px;
  margin-top: 1rem;
`

const SlippageInput = styled.input<{ isActive: boolean }>`
  background: ${({ theme, isActive }) => (isActive ? theme.dialog : theme.secondary)};
  border: none;
  outline: none;
  color: ${({ theme }) => theme.text};
  text-align: right;
  width: 100%;
  font-size: 14px;
  padding: 0;

  :focus {
    background: ${({ theme }) => theme.dialog};
  }
`

const SlippageWrapper = styled.div<{ isHidden: boolean }>`
  border-radius: 999px;
  margin-top: 8px;
  background: ${({ theme }) => theme.secondary};
  padding: 2px;
  display: flex;
  display: ${({ isHidden }) => (isHidden ? 'none' : '')};
`

const SlippageItem = styled.div<{ isActive: boolean }>`
  position: relative;
  border-radius: 999px;
  color: ${({ theme, isActive }) => (isActive ? theme.text : theme.subText)};
  font-size: 14px;
  padding: 4px;
  font-weight: 500;
  flex: 2;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
  background: ${({ theme, isActive }) => (isActive ? theme.dialog : theme.secondary)};
  cursor: pointer;
  :hover {
    background: ${({ theme }) => theme.dialog};
    input {
      background: ${({ theme }) => theme.dialog};
    }
  }
`

const SlippageContainer = styled.div`
  margin-top: 1rem;
`

export const CurrentSlippageButton = styled(SettingBtn)`
  background: ${({ theme }) => theme.secondary};
  width: 4rem;
  height: 2rem;
  margin-left: 0.5rem;
  margin-right: 0.4rem;
  :hover {
    opacity: 0.8;
  }
`

enum ModalType {
  CURRENCY_IN = 'currency_in',
  CURRENCY_OUT = 'currency_out',
  REVIEW = 'review',
  DEXES_SETTING = 'dexes_setting',
  IMPORT_TOKEN = 'import_token',
}

interface FeeSetting {
  chargeFeeBy: 'currency_in' | 'currency_out'
  feeReceiver: string
  // BPS: 10_000
  // 10 means 0.1%
  feeAmount: number
  isInBps: boolean
}

const BPS = 10_000

const MAX_SLIPPAGE_IN_BIPS = 2_000

const parseSlippageInput = (str: string): number => Math.round(Number.parseFloat(str) * 100)

const validateSlippageInput = (str: string): { isValid: boolean; message?: string } => {
  if (str === '') {
    return {
      isValid: true,
    }
  }

  const numberRegex = /^\s*([0-9]+)(\.\d+)?\s*$/
  if (!str.match(numberRegex)) {
    return {
      isValid: false,
      message: `Enter a valid slippage percentage`,
    }
  }

  const rawSlippage = parseSlippageInput(str)

  if (Number.isNaN(rawSlippage)) {
    return {
      isValid: false,
      message: `Enter a valid slippage percentage`,
    }
  }

  if (rawSlippage < 0) {
    return {
      isValid: false,
      message: `Enter a valid slippage percentage`,
    }
  } else if (rawSlippage < 50) {
    return {
      isValid: true,
      message: `Your transaction may fail`,
    }
  } else if (rawSlippage > MAX_SLIPPAGE_IN_BIPS) {
    return {
      isValid: false,
      message: `Enter a smaller slippage percentage`,
    }
  } else if (rawSlippage > 500) {
    return {
      isValid: true,
      message: `Your transaction may be frontrun`,
    }
  }

  return {
    isValid: true,
  }
}

export interface WidgetProps {
  client: string
  provider?: any
  tokenList?: TokenInfo[]
  theme?: Theme
  defaultTokenIn?: string
  defaultTokenOut?: string
  feeSetting?: FeeSetting
}

const Widget = ({
  defaultTokenIn,
  defaultTokenOut,
  feeSetting,
  client,
}: {
  defaultTokenIn?: string
  defaultTokenOut?: string
  feeSetting?: FeeSetting
  client: string
}) => {
  const [showModal, setShowModal] = useState<ModalType | null>(null)

  const { chainId } = useActiveWeb3()

  const isUnsupported = !SUPPORTED_NETWORKS.includes(chainId.toString())

  const wrappedTokens: { [chainId: number]: string } = {
    1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    137: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    56: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    43114: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    250: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    25: '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23',
    42161: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    199: '0x8d193c6efa90bcff940a98785d1ce9d093d3dc8a',
    106: '0xc579d1f3cf86749e05cd06f7ade17856c2ce3126',
    1313161554: '0xc42c30ac6cc15fac9bd938618bcaa1a1fae8501d',
    42262: '0x21c718c22d52d0f3a789b752d4c2fd5908a8a733',
    10: '0x4200000000000000000000000000000000000006',
  }

  if (defaultTokenIn?.toLocaleLowerCase() === wrappedTokens[chainId]) {
    defaultTokenIn = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  }

  if (defaultTokenOut?.toLocaleLowerCase() === wrappedTokens[chainId]) {
    defaultTokenOut = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  }

  const tokens = useTokens()
  const {
    loading,
    error,
    tokenIn,
    tokenOut,
    setTokenIn,
    setTokenOut,
    inputAmout,
    setInputAmount,
    trade: routeTrade,
    slippage,
    setSlippage,
    getRate,
    deadline,
    allDexes,
    excludedDexes,
    setExcludedDexes,
    setTrade,
  } = useSwap({
    defaultTokenIn,
    defaultTokenOut,
    feeSetting,
  })

  const trade = isUnsupported ? null : routeTrade

  const [inverseRate, setInverseRate] = useState(false)

  const { balances, refetch } = useTokenBalances(tokens.map(item => item.address))

  const tokenInInfo =
    tokenIn === NATIVE_TOKEN_ADDRESS ? NATIVE_TOKEN[chainId] : tokens.find(item => item.address === tokenIn)

  const tokenOutInfo =
    tokenOut === NATIVE_TOKEN_ADDRESS ? NATIVE_TOKEN[chainId] : tokens.find(item => item.address === tokenOut)

  const amountOut = trade?.routeSummary?.amountOut
    ? formatUnits(trade.routeSummary.amountOut, tokenOutInfo?.decimals).toString()
    : ''

  let minAmountOut = ''

  if (amountOut) {
    minAmountOut = (Number(amountOut) * (1 - slippage / 10_000)).toPrecision(8).toString()
  }

  const tokenInBalance = balances[tokenIn] || BigNumber.from(0)
  const tokenOutBalance = balances[tokenOut] || BigNumber.from(0)

  const tokenInWithUnit = formatUnits(tokenInBalance, tokenInInfo?.decimals || 18)
  const tokenOutWithUnit = formatUnits(tokenOutBalance, tokenOutInfo?.decimals || 18)

  const rate =
    trade?.routeSummary?.amountIn &&
    trade?.routeSummary?.amountOut &&
    parseFloat(formatUnits(trade.routeSummary.amountOut, tokenOutInfo?.decimals || 18)) / parseFloat(inputAmout)

  const formattedTokenInBalance = parseFloat(parseFloat(tokenInWithUnit).toPrecision(10))

  const formattedTokenOutBalance = parseFloat(parseFloat(tokenOutWithUnit).toPrecision(10))

  const theme = useTheme()

  const priceImpact = !trade?.routeSummary.amountOutUsd
    ? -1
    : (+trade.routeSummary.amountInUsd - +trade.routeSummary.amountOutUsd * 100) / +trade.routeSummary.amountInUsd

  const [tokenToImport, setTokenToImport] = useState<TokenInfo | null>(null)
  const [importType, setImportType] = useState<'in' | 'out'>('in')

  const modalContent = (() => {
    switch (showModal) {
      case ModalType.CURRENCY_IN:
        return (
          <SelectCurrency
            selectedToken={tokenIn}
            onChange={address => {
              if (address === tokenOut) setTokenOut(tokenIn)
              setTokenIn(address)
              setShowModal(null)
            }}
            onImport={(token: TokenInfo) => {
              setTokenToImport(token)
              setShowModal(ModalType.IMPORT_TOKEN)
              setImportType('in')
            }}
          />
        )
      case ModalType.CURRENCY_OUT:
        return (
          <SelectCurrency
            selectedToken={tokenOut}
            onChange={address => {
              if (address === tokenIn) setTokenIn(tokenOut)
              setTokenOut(address)
              setShowModal(null)
            }}
            onImport={(token: TokenInfo) => {
              setTokenToImport(token)
              setShowModal(ModalType.IMPORT_TOKEN)
              setImportType('out')
            }}
          />
        )
      case ModalType.REVIEW:
        if (rate && tokenInInfo && trade && tokenOutInfo)
          return (
            <Confirmation
              trade={trade}
              tokenInInfo={tokenInInfo}
              amountIn={inputAmout}
              tokenOutInfo={tokenOutInfo}
              amountOut={amountOut}
              rate={rate}
              priceImpact={priceImpact}
              slippage={slippage}
              deadline={deadline}
              client={client}
              onClose={() => {
                setShowModal(null)
                refetch()
              }}
            />
          )
        return null
      case ModalType.DEXES_SETTING:
        return <DexesSetting allDexes={allDexes} excludedDexes={excludedDexes} setExcludedDexes={setExcludedDexes} />

      case ModalType.IMPORT_TOKEN:
        if (tokenToImport)
          return (
            <ImportModal
              token={tokenToImport}
              onImport={() => {
                if (importType === 'in') {
                  setTokenIn(tokenToImport.address)
                  setShowModal(null)
                } else {
                  setTokenOut(tokenToImport.address)
                  setShowModal(null)
                }
              }}
            />
          )
        return null
      default:
        return null
    }
  })()

  const {
    loading: checkingAllowance,
    approve,
    approvalState,
  } = useApproval(trade?.routeSummary?.amountIn || '0', tokenIn, trade?.routerAddress || '')

  const [slippageValue, setSlippageValue] = useState(() => {
    return ((slippage * 100) / BPS).toString()
  })

  const [isFocus, setIsFocus] = useState(false)

  const { isValid, message } = validateSlippageInput(slippageValue)

  const [isSlippageShown, setSlippageShown] = useState(false)

  const modalTitle = (() => {
    switch (showModal) {
      case ModalType.CURRENCY_IN:
        return 'Select a token'
      case ModalType.CURRENCY_OUT:
        return 'Select a token'
      case ModalType.DEXES_SETTING:
        return 'Liquidity Sources'
      case ModalType.IMPORT_TOKEN:
        return 'Import Token'

      default:
        return null
    }
  })()

  const setSlippageFinalValue = (slippage: number) => {
    setSlippage(slippage)
    setSlippageValue((slippage / 100).toString())
  }

  return (
    <Wrapper>
      <DialogWrapper className={showModal ? 'open' : 'close'}>
        {showModal !== ModalType.REVIEW && (
          <ModalHeader>
            <ModalTitle onClick={() => setShowModal(null)} role="button">
              <BackIcon style={{ color: theme.subText }} />
              {modalTitle}
            </ModalTitle>
          </ModalHeader>
        )}
        <ContentWrapper>{modalContent}</ContentWrapper>
        <PoweredBy style={{ marginTop: '0' }}>
          Powered By
          <KyberSwapLogo />
        </PoweredBy>
      </DialogWrapper>
      <Title>SWAP</Title>
      <InputWrapper style={{ marginTop: '0.5rem' }}>
        <BalanceRow>
          <div>
            <MaxHalfBtn onClick={() => setInputAmount(tokenInWithUnit)}>Max</MaxHalfBtn>
            <MaxHalfBtn onClick={() => setInputAmount((parseFloat(tokenInWithUnit) / 2).toString())}>Half</MaxHalfBtn>
          </div>
          <AccountBalance>
            <WalletIcon />
            {formattedTokenInBalance}
          </AccountBalance>
        </BalanceRow>

        <InputRow>
          <Input
            value={inputAmout}
            onChange={e => {
              let value = e.target.value.replace(/,/g, '.')
              const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
              if (value === '' || inputRegex.test(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
                const decimalIndex = value.indexOf('.')
                if (decimalIndex !== -1 && value.length - decimalIndex - 1 > 18) {
                  value = parseFloat(value).toFixed(18)
                }
                setInputAmount(value)
              }
            }}
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            type="text"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder="0.0"
            minLength={1}
            maxLength={79}
            spellCheck="false"
          />

          {!!trade?.routeSummary?.amountInUsd && (
            <span
              style={{
                fontSize: '12px',
                marginRight: '4px',
                color: theme.subText,
              }}
            >
              ~
              {(+trade.routeSummary.amountInUsd).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
          )}

          <SelectTokenBtn onClick={() => !isUnsupported && setShowModal(ModalType.CURRENCY_IN)}>
            {tokenInInfo ? (
              <>
                <img
                  width="20"
                  height="20"
                  alt="tokenIn"
                  src={tokenInInfo?.logoURI}
                  style={{ borderRadius: '50%' }}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null // prevents looping
                    currentTarget.src = new URL('../../assets/question.svg', import.meta.url).href
                  }}
                />
                <div style={{ marginLeft: '0.375rem' }}>{tokenInInfo?.symbol}</div>
              </>
            ) : (
              <SelectTokenText>Select a token</SelectTokenText>
            )}
            <DropdownIcon />
          </SelectTokenBtn>
        </InputRow>
      </InputWrapper>

      <MiddleRow>
        <MiddleLeft>
          <RefreshBtn
            loading={loading}
            onRefresh={() => {
              getRate()
            }}
            trade={trade}
          />
          <Rate>
            {(() => {
              if (!rate) return '--'
              return !inverseRate
                ? `1 ${tokenInInfo?.symbol} = ${+rate.toPrecision(10)} ${tokenOutInfo?.symbol}`
                : `1 ${tokenOutInfo?.symbol} = ${+(1 / rate).toPrecision(10)} ${tokenInInfo?.symbol}`
            })()}
          </Rate>

          {!!rate && (
            <SettingBtn onClick={() => setInverseRate(prev => !prev)} style={{ marginLeft: '0.4rem' }}>
              <SwapIcon />
            </SettingBtn>
          )}
        </MiddleLeft>

        <SwitchBtn
          onClick={() => {
            setTrade(null)
            setTokenIn(tokenOut)
            setTokenOut(tokenIn)
          }}
        >
          <SwitchIcon />
        </SwitchBtn>
      </MiddleRow>

      <InputWrapper>
        <BalanceRow>
          <div />
          <AccountBalance>
            <WalletIcon />
            {formattedTokenOutBalance}
          </AccountBalance>
        </BalanceRow>

        <InputRow>
          <Input disabled value={+Number(amountOut).toPrecision(8)} />

          {!!trade?.routeSummary?.amountOutUsd && (
            <span
              style={{
                fontSize: '12px',
                marginRight: '4px',
                color: theme.subText,
              }}
            >
              ~
              {(+trade.routeSummary.amountOutUsd).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
          )}
          <SelectTokenBtn onClick={() => !isUnsupported && setShowModal(ModalType.CURRENCY_OUT)}>
            {tokenOutInfo ? (
              <>
                <img
                  width="20"
                  height="20"
                  alt="tokenOut"
                  src={tokenOutInfo?.logoURI}
                  style={{ borderRadius: '50%' }}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null // prevents looping
                    currentTarget.src = new URL('../../assets/question.svg', import.meta.url).href
                  }}
                />
                <div style={{ marginLeft: '0.375rem' }}>{tokenOutInfo?.symbol}</div>
              </>
            ) : (
              <SelectTokenText>Select a token</SelectTokenText>
            )}
            <DropdownIcon />
          </SelectTokenBtn>
        </InputRow>
      </InputWrapper>

      <SlippageContainer>
        <MiddleRow>
          <MiddleLeft>
            Max Slippage:
            <CurrentSlippageButton onClick={() => setSlippageShown(!isSlippageShown)}>
              {slippageValue + '%'}
            </CurrentSlippageButton>
            <InfoHelper
              color={theme.text}
              text={`Transaction will revert if there is an adverse rate change that is higher than this %`}
            />
          </MiddleLeft>
        </MiddleRow>
        <SlippageWrapper isHidden={!isSlippageShown}>
          <SlippageItem isActive={slippage === 5} onClick={() => setSlippageFinalValue(5)}>
            0.05%
          </SlippageItem>
          <SlippageItem isActive={slippage === 10} onClick={() => setSlippageFinalValue(10)}>
            0.1%
          </SlippageItem>
          <SlippageItem isActive={slippage === 50} onClick={() => setSlippageFinalValue(50)}>
            0.5%
          </SlippageItem>
          <SlippageItem isActive={slippage === 100} onClick={() => setSlippageFinalValue(100)}>
            1%
          </SlippageItem>
          <SlippageItem
            isActive
            style={{
              background: isFocus ? theme.dialog : undefined,
              border: message ? (isValid ? `1px solid ${theme.warning}` : `1px solid ${theme.error}`) : undefined,
            }}
          >
            {message && (
              <AlertIcon
                style={{
                  position: 'absolute',
                  left: 4,
                  width: 20,
                  color: isValid ? theme.warning : theme.error,
                }}
              />
            )}
            <SlippageInput
              isActive
              placeholder="Custom"
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              value={slippageValue}
              onChange={e => {
                let slippage = e.target.value

                if (slippage === '') {
                  slippage = '0'
                }

                const valid = validateSlippageInput(slippage)

                if (valid.isValid) {
                  setSlippageFinalValue(parseSlippageInput(slippage))
                }
              }}
            />
            <span style={{ height: '16px' }}>%</span>
          </SlippageItem>
        </SlippageWrapper>
        {message && (
          <div
            style={{
              fontSize: '12px',
              color: isValid ? theme.warning : theme.error,
              textAlign: 'left',
              marginTop: '4px',
            }}
          >
            {message}
          </div>
        )}
      </SlippageContainer>

      <Button
        disabled={!!error || loading || checkingAllowance || approvalState === APPROVAL_STATE.PENDING || isUnsupported}
        onClick={async () => {
          if (approvalState === APPROVAL_STATE.NOT_APPROVED) {
            approve()
          } else {
            setShowModal(ModalType.REVIEW)
          }
        }}
      >
        {isUnsupported ? (
          <PoweredBy style={{ fontSize: '16px', marginTop: '0' }}>
            <AlertIcon style={{ width: '24px', height: '24px' }} />
            Unsupported network
          </PoweredBy>
        ) : loading ? (
          <Dots>Calculate best route</Dots>
        ) : error ? (
          error
        ) : checkingAllowance ? (
          <Dots>Checking Allowance</Dots>
        ) : approvalState === APPROVAL_STATE.NOT_APPROVED ? (
          'Approve'
        ) : approvalState === APPROVAL_STATE.PENDING ? (
          <Dots>Approving</Dots>
        ) : (
          'Swap'
        )}
      </Button>

      <Detail style={{ marginTop: '1rem' }}>
        <DetailTitle>More information</DetailTitle>
        <Divider />
        <DetailRow>
          <DetailLabel>
            Minimum Received
            <InfoHelper text={`Minimum amount you will receive or your transaction will revert`} />
          </DetailLabel>
          <DetailRight>
            {minAmountOut ? `${formatNumber(parseFloat(minAmountOut))} ${tokenOutInfo?.symbol}` : '--'}
          </DetailRight>
        </DetailRow>

        <DetailRow>
          <DetailLabel>
            Gas Fee <InfoHelper text="Estimated network fee for your transaction" />
          </DetailLabel>
          <DetailRight>
            {trade?.routeSummary?.gasUsd ? '$' + (+trade.routeSummary.gasUsd).toPrecision(4) : '--'}
          </DetailRight>
        </DetailRow>

        <DetailRow>
          <DetailLabel>
            Price Impact
            <InfoHelper text="Estimated change in price due to the size of your transaction" />
          </DetailLabel>
          <DetailRight
            style={{
              color: priceImpact > 15 ? theme.error : priceImpact > 5 ? theme.warning : theme.text,
            }}
          >
            {priceImpact === -1 ? '--' : priceImpact > 0.01 ? priceImpact.toFixed(3) + '%' : '< 0.01%'}
          </DetailRight>
        </DetailRow>
      </Detail>

      <PoweredBy>
        Powered By
        <KyberSwapLogo />
      </PoweredBy>
    </Wrapper>
  )
}

export default function SwapWidget({
  provider,
  tokenList,
  theme,
  defaultTokenIn,
  defaultTokenOut,
  feeSetting,
  client,
}: WidgetProps) {
  return (
    <StrictMode>
      <ThemeProvider theme={theme || defaultTheme}>
        <Web3Provider provider={provider}>
          <TokenListProvider tokenList={tokenList}>
            <Widget
              defaultTokenIn={defaultTokenIn}
              defaultTokenOut={defaultTokenOut}
              feeSetting={feeSetting}
              client={client}
            />
          </TokenListProvider>
        </Web3Provider>
      </ThemeProvider>
    </StrictMode>
  )
}
