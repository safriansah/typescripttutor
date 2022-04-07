import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react'
import theme from '../theme'; 
import { createClient, dedupExchange, fetchExchange, Provider } from 'urql';
import { cacheExchange, query } from '@urql/exchange-graphcache';
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';
import { betterUpdateQuery } from '../utils/betterUpdateQuery';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <ColorModeProvider
        options={{
          useSystemColorMode: true,
        }}
      >
        <Component {...pageProps} />
      </ColorModeProvider>
    </ChakraProvider>
  )
}

export default MyApp
