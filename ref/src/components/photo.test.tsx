import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vite-plus/test'
import { renderWithProviders } from '../test/render'
import { Photo } from './photo'

describe('photo', () => {
  it('enlarges on tap and puts the print back on the second tap', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(
      <Photo
        image={{ fullsize: 'f', thumb: 't', alt: 'a caption' }}
        tilt={1.2}
        nudge={6}
        tapeTilt={3}
        tapeHue={200}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'a caption' }))
    expect(screen.getByRole('dialog', { name: 'photo' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'close photo' })).toBeTruthy()
    // the print in the page steps aside while its viewer copy is out
    expect(container.querySelector('.photo.is-away')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'close photo' }))
    expect(screen.queryByRole('button', { name: 'close photo' })).toBeNull()
    expect(screen.queryByRole('dialog', { name: 'photo' })).toBeNull()
    // and comes back once the viewer is gone
    expect(container.querySelector('.photo.is-away')).toBeNull()
    expect(container.querySelector('.photo')).toBeTruthy()
  })
})
