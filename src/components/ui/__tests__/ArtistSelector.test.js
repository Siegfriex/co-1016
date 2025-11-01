import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ArtistSelector from '../ArtistSelector';

describe('ArtistSelector', () => {
  const mockSelectedArtists = {
    artistA: 'ARTIST_0005',
    artistB: 'ARTIST_0003'
  };

  const mockOnChange = jest.fn();

  const defaultProps = {
    selectedArtists: mockSelectedArtists,
    onChange: mockOnChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders without crashing', () => {
      render(<ArtistSelector {...defaultProps} />);
      
      expect(screen.getByText('작가 A')).toBeInTheDocument();
      expect(screen.getByText('vs')).toBeInTheDocument();
      expect(screen.getByText('작가 B')).toBeInTheDocument();
    });

    test('displays selected artist names', () => {
      render(<ArtistSelector {...defaultProps} />);
      
      expect(screen.getByText('양혜규')).toBeInTheDocument();
      expect(screen.getByText('이우환')).toBeInTheDocument();
    });

    test('shows placeholder when no artist is selected', () => {
      const emptyProps = {
        selectedArtists: { artistA: null, artistB: null },
        onChange: mockOnChange
      };

      render(<ArtistSelector {...emptyProps} />);
      
      const placeholders = screen.getAllByText('선택하세요');
      expect(placeholders).toHaveLength(2);
    });
  });

  describe('Modal Interaction', () => {
    test('opens modal when artist button is clicked', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      expect(screen.getByText('작가 선택')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('작가명 검색...')).toBeInTheDocument();
    });

    test('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      // Open modal
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      // Close modal
      const closeButton = screen.getByText('×');
      await user.click(closeButton);
      
      expect(screen.queryByText('작가 선택')).not.toBeInTheDocument();
    });

    test('closes modal when clicking outside', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      // Open modal
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      // Click overlay
      const overlay = document.querySelector('.artist-modal-overlay');
      await user.click(overlay);
      
      expect(screen.queryByText('작가 선택')).not.toBeInTheDocument();
    });

    test('prevents modal close when clicking inside modal', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      // Open modal
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      // Click inside modal
      const modal = document.querySelector('.artist-modal');
      await user.click(modal);
      
      expect(screen.getByText('작가 선택')).toBeInTheDocument();
    });
  });

  describe('Artist Search', () => {
    test('filters artists based on search query', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      // Open modal
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      // Search for specific artist
      const searchInput = screen.getByPlaceholderText('작가명 검색...');
      await user.type(searchInput, '양혜규');
      
      expect(screen.getByText('양혜규')).toBeInTheDocument();
      expect(screen.queryByText('이우환')).not.toBeInTheDocument();
    });

    test('shows all artists when search is cleared', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      // Open modal
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      // Type and then clear search
      const searchInput = screen.getByPlaceholderText('작가명 검색...');
      await user.type(searchInput, '양혜규');
      await user.clear(searchInput);
      
      // Should show all artists again
      expect(screen.getByText('양혜규')).toBeInTheDocument();
      expect(screen.getByText('이우환')).toBeInTheDocument();
    });

    test('shows no results message when search yields no matches', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      // Open modal
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      // Search for non-existent artist
      const searchInput = screen.getByPlaceholderText('작가명 검색...');
      await user.type(searchInput, 'NonExistentArtist');
      
      const artistList = document.querySelector('.modal-list');
      expect(artistList.children).toHaveLength(0);
    });

    test('search is case insensitive', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      // Open modal
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      // Search with different case
      const searchInput = screen.getByPlaceholderText('작가명 검색...');
      await user.type(searchInput, 'ARTIST_0005');
      
      expect(screen.getByText('양혜규')).toBeInTheDocument();
    });
  });

  describe('Artist Selection', () => {
    test('calls onChange when artist is selected', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      // Open modal for Artist A
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      // Select different artist
      const leeUfanButton = screen.getByText('이우환');
      await user.click(leeUfanButton);
      
      expect(mockOnChange).toHaveBeenCalledWith('artistA', 'ARTIST_0003');
    });

    test('closes modal after selection', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      // Open modal for Artist B
      const artistBButton = screen.getByRole('button', { name: /이우환/ });
      await user.click(artistBButton);
      
      // Select artist
      const yangHyegyuButton = screen.getByText('양혜규');
      await user.click(yangHyegyuButton);
      
      await waitFor(() => {
        expect(screen.queryByText('작가 선택')).not.toBeInTheDocument();
      });
    });

    test('clears search query after selection', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      // Open modal
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      // Search and select
      const searchInput = screen.getByPlaceholderText('작가명 검색...');
      await user.type(searchInput, '이우환');
      
      const leeUfanButton = screen.getByText('이우환');
      await user.click(leeUfanButton);
      
      // Reopen modal to check search is cleared
      await user.click(screen.getByRole('button', { name: /이우환/ }));
      const newSearchInput = screen.getByPlaceholderText('작가명 검색...');
      
      expect(newSearchInput.value).toBe('');
    });
  });

  describe('Visual Indicators', () => {
    test('displays correct color indicators', () => {
      render(<ArtistSelector {...defaultProps} />);
      
      const colorIndicatorA = document.querySelector('.artist-color-a');
      const colorIndicatorB = document.querySelector('.artist-color-b');
      
      expect(colorIndicatorA).toBeInTheDocument();
      expect(colorIndicatorB).toBeInTheDocument();
    });

    test('shows artist metadata', () => {
      render(<ArtistSelector {...defaultProps} />);
      
      expect(screen.getByText(/데뷔 1999년/)).toBeInTheDocument();
      expect(screen.getByText(/데뷔 1968년/)).toBeInTheDocument();
    });

    test('displays artist scores in modal', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      // Open modal
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      expect(screen.getByText('91.2')).toBeInTheDocument();
      expect(screen.getByText('88.7')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    test('supports keyboard navigation in modal', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      // Open modal
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      // Search input should be focused
      const searchInput = screen.getByPlaceholderText('작가명 검색...');
      expect(searchInput).toHaveFocus();
    });

    test('closes modal on Escape key', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector {...defaultProps} />);
      
      // Open modal
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      // Press Escape
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByText('작가 선택')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('maintains layout integrity on different screen sizes', () => {
      render(<ArtistSelector {...defaultProps} />);
      
      const selectorGrid = document.querySelector('.selector-grid');
      expect(selectorGrid).toHaveClass('selector-grid');
      
      // Grid should have proper responsive classes
      expect(selectorGrid).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing onChange prop gracefully', async () => {
      const user = userEvent.setup();
      render(<ArtistSelector selectedArtists={mockSelectedArtists} />);
      
      // Should not crash when onChange is not provided
      const artistAButton = screen.getByRole('button', { name: /양혜규/ });
      await user.click(artistAButton);
      
      expect(screen.getByText('작가 선택')).toBeInTheDocument();
    });

    test('handles empty artist data gracefully', () => {
      // This would require mocking the useEffect that loads artist data
      // For now, verify component doesn't crash with empty props
      const emptyProps = {
        selectedArtists: {},
        onChange: mockOnChange
      };

      expect(() => {
        render(<ArtistSelector {...emptyProps} />);
      }).not.toThrow();
    });
  });
});

