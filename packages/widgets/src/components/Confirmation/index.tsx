import styled, { keyframes } from 'styled-components'
import { Trade } from '../../hooks/useSwap'
import { Button } from '../Widget/styled'
import { useActiveWeb3 } from '../../hooks/useWeb3Provider'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BigNumber } from 'ethers'
import { AGGREGATOR_PATH, NATIVE_TOKEN_ADDRESS, SCAN_LINK, TokenInfo, WRAPPED_NATIVE_TOKEN } from '../../constants'
import { ReactComponent as BackIcon } from '../../assets/back.svg'
import { ReactComponent as Loading } from '../../assets/loader.svg'
import { ReactComponent as External } from '../../assets/external.svg'
import { ReactComponent as SuccessSVG } from '../../assets/success.svg'
import { ReactComponent as ErrorIcon } from '../../assets/error.svg'
import { ReactComponent as Info } from '../../assets/info.svg'
import { ReactComponent as DropdownIcon } from '../../assets/dropdown.svg'
import { useWETHContract } from '../../hooks/useContract'
import { friendlyError } from '../../utils/errorMessage'

const Success = styled(SuccessSVG)`
  color: ${({ theme }) => theme.success};
`

const StyledError = styled(ErrorIcon)`
  color: ${({ theme }) => theme.error};
`

const Central = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Spinner = styled(Loading)`
  animation: 2s ${rotate} linear infinite;
  width: 94px;
  height: 94px;
  color: ${({ theme }) => theme.accent};
`

const ViewTx = styled.a`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: ${({ theme }) => theme.accent};
  font-size: 14px;
  gap: 4px;
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  border-bottom: 1px solid ${({ theme }) => theme.stroke};
`

const WaitingText = styled.div`
  font-size: 1rem;
  font-weight: 500;
`

const Amount = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  gap: 6px;
  img {
    border-radius: 50%;
  }
`

const SubText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.subText};
  margin-top: 12px;
`

const ErrMsg = styled.div<{ show: boolean }>`
  margin-top: ${({ show }) => (show ? '12px' : '0')};
  max-height: ${({ show }) => (show ? '200px' : '0')};
  transition: 0.2s ease-out;

  font-size: 14px;
  color: ${({ theme }) => theme.subText};
  overflow-wrap: break-word;
  overflow-y: scroll;

  /* width */
  ::-webkit-scrollbar {
    display: unset;
    width: 6px;
    border-radius: 999px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 999px;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.subText + '66'};
    border-radius: 999px;
  }
`

const ErrorDetail = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
`

const DownIcon = styled(DropdownIcon)<{ open: boolean }>`
  transform: rotate(${({ open }) => (!open ? '0' : '-180deg')});
  transition: all 0.2s ease;
`

function calculateGasMargin(value: BigNumber): BigNumber {
  const defaultGasLimitMargin = BigNumber.from(20_000)
  const gasMargin = value.mul(BigNumber.from(2000)).div(BigNumber.from(10000))

  return gasMargin.gte(defaultGasLimitMargin) ? value.add(gasMargin) : value.add(defaultGasLimitMargin)
}

function Confirmation({
  trade,
  tokenInInfo,
  amountIn,
  tokenOutInfo,
  amountOut,
  rate,
  slippage,
  priceImpact,
  onClose,
  deadline,
  client,
  onTxSubmit,
}: {
  trade: Trade
  tokenInInfo: TokenInfo
  amountIn: string
  tokenOutInfo: TokenInfo
  amountOut: string
  rate: number
  slippage: number
  priceImpact: number
  onClose: () => void
  deadline: number
  client: string
  onTxSubmit?: (txHash: string, data: any) => void
}) {
  const { provider, account, chainId } = useActiveWeb3()

  // `minAmountOut` was used in the default return statement that have been removed
  // let minAmountOut = '--'

  const isWrap =
    trade.routeSummary.tokenIn.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() &&
    trade.routeSummary.tokenOut.toLowerCase() === WRAPPED_NATIVE_TOKEN[chainId].address.toLowerCase()
  const isUnwrap =
    trade.routeSummary.tokenOut.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() &&
    trade.routeSummary.tokenIn.toLowerCase() === WRAPPED_NATIVE_TOKEN[chainId].address.toLowerCase()

  // if (amountOut && !isWrap && !isUnwrap) {
  //   minAmountOut = (Number(amountOut) * (1 - slippage / 10_000)).toPrecision(8).toString()
  // }

  const [attempTx, setAttempTx] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [txStatus, setTxStatus] = useState<'success' | 'failed' | ''>('')
  const [txError, setTxError] = useState<any>('')
  const [showErrorDetail, setShowErrorDetail] = useState(false)

  useEffect(() => {
    if (txHash) {
      const i = setInterval(() => {
        provider?.getTransactionReceipt(txHash).then(res => {
          if (!res) return

          if (res.status) {
            setTxStatus('success')
          } else setTxStatus('failed')
        })
      }, 10_000)

      return () => {
        clearInterval(i)
      }
    }
  }, [txHash, provider])

  const [snapshotTrade, setSnapshotTrade] = useState<{
    amountIn: string
    amountOut: string
  } | null>(null)

  const wethContract = useWETHContract()

  const confirmSwap = useCallback(async () => {
    setSnapshotTrade({ amountIn, amountOut })
    try {
      setAttempTx(true)
      setTxHash('')
      setTxError('')

      if (isWrap) {
        if (!wethContract) return
        const estimateGas = await wethContract.estimateGas.deposit({
          value: BigNumber.from(trade.routeSummary.amountIn).toHexString(),
        })
        const txReceipt = await wethContract.deposit({
          value: BigNumber.from(trade.routeSummary.amountIn).toHexString(),
          gasLimit: calculateGasMargin(estimateGas),
        })

        setTxHash(txReceipt?.hash || '')
        onTxSubmit?.(txReceipt?.hash || '', txReceipt)
        setAttempTx(false)

        return
      }

      if (isUnwrap) {
        if (!wethContract) return
        const estimateGas = await wethContract.estimateGas.withdraw(
          BigNumber.from(trade.routeSummary.amountIn).toHexString(),
        )
        const txReceipt = await wethContract.withdraw(BigNumber.from(trade.routeSummary.amountIn).toHexString(), {
          gasLimit: calculateGasMargin(estimateGas),
        })

        setTxHash(txReceipt?.hash || '')
        onTxSubmit?.(txReceipt?.hash || '', txReceipt)
        setAttempTx(false)

        return
      }

      const date = new Date()
      date.setMinutes(date.getMinutes() + (deadline || 20))

      const buildRes = await fetch(
        `https://aggregator-api.kyberswap.com/${AGGREGATOR_PATH[chainId]}/api/v1/route/build`,
        {
          method: 'POST',
          body: JSON.stringify({
            routeSummary: trade.routeSummary,
            deadline: Math.floor(date.getTime() / 1000),
            slippageTolerance: slippage,
            sender: account,
            recipient: account,
            source: client,
          }),
        },
      ).then(r => r.json())

      if (!buildRes.data) {
        throw new Error('Build route failed: ' + JSON.stringify(buildRes.details))
      }

      const estimateGasOption = {
        from: account,
        to: trade?.routerAddress,
        data: buildRes.data.data,
        value: BigNumber.from(tokenInInfo.address === NATIVE_TOKEN_ADDRESS ? trade?.routeSummary.amountIn : 0),
      }

      const gasEstimated = await provider?.estimateGas(estimateGasOption)

      const res = await provider?.getSigner().sendTransaction({
        ...estimateGasOption,
        gasLimit: calculateGasMargin(gasEstimated || BigNumber.from(0)),
      })

      setTxHash(res?.hash || '')
      onTxSubmit?.(res?.hash || '', res)
      setAttempTx(false)
    } catch (e) {
      setAttempTx(false)
      setTxError(e)
    }
  }, [
    account,
    amountIn,
    amountOut,
    chainId,
    client,
    deadline,
    isUnwrap,
    isWrap,
    onTxSubmit,
    provider,
    slippage,
    tokenInInfo.address,
    trade.routeSummary,
    trade?.routerAddress,
    wethContract,
  ])

  const triggered = useRef<boolean>(false)

  useEffect(() => {
    const isTriggered = triggered.current

    if (!isTriggered) {
      confirmSwap()
      triggered.current = true
    }
  }, [confirmSwap])

  if (attempTx || txHash)
    return (
      <>
        <Central>
          {txStatus === 'success' ? <Success /> : txStatus === 'failed' ? <StyledError /> : <Spinner />}
          {txHash ? (
            txStatus === 'success' ? (
              <WaitingText>Transaction successful</WaitingText>
            ) : txStatus === 'failed' ? (
              <WaitingText>Transaction failed</WaitingText>
            ) : (
              <WaitingText>Processing transaction</WaitingText>
            )
          ) : (
            <WaitingText>Waiting For Confirmation</WaitingText>
          )}
          <Amount>
            <img src={tokenInInfo.logoURI} width="16" height="16" alt="" />
            {+Number(snapshotTrade?.amountIn).toPrecision(6)}
            <BackIcon style={{ width: 16, transform: 'rotate(180deg)' }} />
            <img src={tokenOutInfo.logoURI} width="16" height="16" alt="" />
            {+Number(snapshotTrade?.amountOut).toPrecision(6)}
          </Amount>
          {!txHash && <SubText>Confirm this transaction in your wallet</SubText>}
          {txHash && txStatus === '' && <SubText>Waiting for the transaction to be mined</SubText>}
          {txHash && (
            <ViewTx href={`${SCAN_LINK[chainId]}/tx/${txHash}`} target="_blank" rel="noopener norefferer">
              View transaction <External />
            </ViewTx>
          )}
        </Central>

        <Divider />
        <Button style={{ marginTop: 0 }} onClick={onClose}>
          Close
        </Button>
      </>
    )

  if (txError)
    return (
      <>
        <Central>
          <StyledError />
          <WaitingText>{friendlyError(txError)}</WaitingText>
        </Central>

        <div>
          <Divider />
          <ErrorDetail role="button" onClick={() => setShowErrorDetail(prev => !prev)}>
            <div
              style={{
                display: 'flex',
                padding: '8px 0',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
              }}
            >
              <Info />
              Error details
            </div>
            <DownIcon open={showErrorDetail} />
          </ErrorDetail>
          <Divider />
          <ErrMsg show={showErrorDetail}>{txError?.data?.message || txError?.message}</ErrMsg>
          {txHash && (
            <ViewTx>
              View transaction <External />
            </ViewTx>
          )}
        </div>

        <Divider />

        <Button style={{ marginTop: 0 }} onClick={onClose}>
          {txError ? 'Dismiss' : 'Close'}
        </Button>
      </>
    )

  return <></>
}

export default Confirmation
