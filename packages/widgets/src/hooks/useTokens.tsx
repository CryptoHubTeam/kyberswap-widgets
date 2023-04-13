import { createContext, ReactNode, useContext, useState } from 'react'
import { DEFAULT_TOKENS, TokenInfo } from '../constants'
import { useActiveWeb3 } from './useWeb3Provider'

const TokenContext = createContext<{
  tokenList?: TokenInfo[]
  importedTokens: TokenInfo[]
  addToken: (token: TokenInfo) => void
  removeToken: (token: TokenInfo) => void
}>({
  tokenList: [],
  importedTokens: [],
  addToken: () => {
    //
  },
  removeToken: () => {
    //
  },
})

export const TokenListProvider = ({ tokenList, children }: { tokenList?: TokenInfo[]; children: ReactNode }) => {
  const { chainId } = useActiveWeb3()

  const [importedTokens, setImportedTokens] = useState<TokenInfo[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const localStorageTokens = JSON.parse(localStorage.getItem('importedTokens') || '[]')

        return localStorageTokens
      } catch (e) {
        return []
      }
    }

    return []
  })

  const addToken = (token: TokenInfo) => {
    const newTokens = [...importedTokens.filter(t => t.address !== token.address), token]
    setImportedTokens(newTokens)
    if (typeof window !== 'undefined') localStorage.setItem('importedTokens', JSON.stringify(newTokens))
  }

  const removeToken = (token: TokenInfo) => {
    const newTokens = importedTokens.filter(
      t => t.address.toLowerCase() !== token.address.toLowerCase() && t.chainId === token.chainId,
    )

    setImportedTokens(newTokens)
    if (typeof window !== 'undefined') localStorage.setItem('importedTokens', JSON.stringify(newTokens))
  }

  const getTokensList = () => {
    if (!tokenList?.length || tokenList.length === 0) {
      return DEFAULT_TOKENS[chainId]
    }

    const fullTokensList: TokenInfo[] = [...DEFAULT_TOKENS[chainId]]

    fullTokensList.unshift(...tokenList)

    const uniqueTokens = [...new Map(fullTokensList.map(t => [t.address, t])).values()]

    return uniqueTokens
  }

  return (
    <TokenContext.Provider
      value={{
        tokenList: getTokensList(),
        importedTokens,
        addToken,
        removeToken,
      }}
    >
      {children}
    </TokenContext.Provider>
  )
}

export const useTokens = () => {
  const { tokenList, importedTokens } = useContext(TokenContext)
  const { chainId } = useActiveWeb3()

  return [
    ...importedTokens.filter(item => item.chainId === chainId).map(item => ({ ...item, isImport: true })),
    ...(tokenList || []),
  ]
}

export const useImportedTokens = () => {
  const { addToken, removeToken, importedTokens } = useContext(TokenContext)

  return {
    addToken,
    removeToken,
    importedTokens,
  }
}
