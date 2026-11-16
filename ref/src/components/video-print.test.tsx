import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vite-plus/test'
import { renderWithProviders } from '../test/render'
import { VideoPrint } from './video-print'

describe('video print', () => {
  it('plays in place when tapped', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(
      <VideoPrint thumbnail="t" playlist="https://video/x.m3u8" alt="a clip" seed="at://v" />,
    )

    expect(screen.getByAltText('a clip')).toBeTruthy()
    expect(screen.queryByText(/\[video\]/)).toBeNull()
    expect(container.querySelector('video')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'a clip' }))

    const video = container.querySelector('video')
    expect(video).toBeTruthy()
    expect(video).toHaveAttribute('poster', 't')
  })

  it('keeps a still when the video has no playlist', () => {
    const { container } = renderWithProviders(<VideoPrint thumbnail="t" seed="at://v" />)

    expect(screen.getByAltText('video')).toBeTruthy()
    expect(container.querySelector('video')).toBeNull()
  })
})
