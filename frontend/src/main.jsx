import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CardsContextProvider } from './context/CardContext.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { StripeProvider } from './context/StripeContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthContextProvider>
        <CardsContextProvider>
          <CartProvider> 
            <StripeProvider>
              <App />
            </StripeProvider>
          </CartProvider>
        </CardsContextProvider>
      </AuthContextProvider>
    </ThemeProvider>
  </StrictMode>,
)