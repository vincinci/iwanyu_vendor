import { render, screen } from '@testing-library/react'
import App from '../../App'
import { AuthProvider } from '../../providers/AuthProvider'

describe('Routing smoke', () => {
  it('renders unified auth page at root', async () => {
    window.history.pushState({}, '', '/')
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    )
    expect(await screen.findByText(/Iwanyu/)).toBeInTheDocument()
  })
})

