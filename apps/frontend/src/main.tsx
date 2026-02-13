import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from './apollo/client.ts'
import AppWrapper from './AppWrapper.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ApolloProvider client={apolloClient}>
        <AppWrapper />
      </ApolloProvider>
    </BrowserRouter>
  </StrictMode>,
)
