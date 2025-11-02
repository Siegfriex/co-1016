import React, { useState, useEffect, useMemo, useCallback } from 'react';

const ArtistSelector = React.memo(({ selectedArtists, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableArtists, setAvailableArtists] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null); // 'artistA' | 'artistB'

  // 목업 아티스트 목록
  useEffect(() => {
    // 실제로는 API 호출: fetch('/api/artists/search')
    setAvailableArtists([
      { id: 'ARTIST_0005', name: '양혜규', debut_year: 1999, total_score: 91.2 },
      { id: 'ARTIST_0003', name: '이우환', debut_year: 1968, total_score: 88.7 },
      { id: 'ARTIST_0001', name: '백남준', debut_year: 1956, total_score: 95.3 },
      { id: 'ARTIST_0007', name: '김수자', debut_year: 1983, total_score: 84.1 },
      { id: 'ARTIST_0012', name: '박서보', debut_year: 1962, total_score: 89.4 }
    ]);
  }, []);

  // 성능 최적화: 아티스트 선택 핸들러 안정화
  const handleArtistSelect = useCallback((artistId) => {
    if (editingPosition && onChange) {
      onChange(editingPosition, artistId);
      setEditingPosition(null);
      setIsOpen(false);
      setSearchQuery('');
    }
  }, [editingPosition, onChange]);

  // 성능 최적화: 검색 결과 메모이제이션
  const filteredArtists = useMemo(() => {
    return availableArtists.filter(artist =>
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableArtists, searchQuery]);

  // 성능 최적화: 아티스트 조회 함수 메모이제이션
  const getArtistById = useCallback((id) => {
    return availableArtists.find(artist => artist.id === id);
  }, [availableArtists]);

  // 접근성: 키보드 핸들러
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
      setEditingPosition(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  // 접근성: 모달 오버레이 클릭 핸들러
  const handleOverlayClick = useCallback((event) => {
    if (event.target === event.currentTarget) {
      setIsOpen(false);
      setEditingPosition(null);
      setSearchQuery('');
    }
  }, []);

  return (
    <div className="artist-selector">
      <div className="selector-grid">
        {/* Artist A 선택기 */}
        <div className="selector-item">
          <label className="selector-label">작가 A</label>
          <button
            className="artist-button artist-button--a"
            onClick={() => {
              setEditingPosition('artistA');
              setIsOpen(true);
            }}
          >
            <div className="artist-info">
              <span className="artist-name">
                {getArtistById(selectedArtists.artistA)?.name || '선택하세요'}
              </span>
              <span className="artist-meta">
                {getArtistById(selectedArtists.artistA)?.debut_year && 
                  `데뷔 ${getArtistById(selectedArtists.artistA).debut_year}년`}
              </span>
            </div>
            <span className="artist-color-indicator artist-color-a"></span>
          </button>
        </div>

        <div className="selector-vs">vs</div>

        {/* Artist B 선택기 */}
        <div className="selector-item">
          <label className="selector-label">작가 B</label>
          <button
            className="artist-button artist-button--b"
            onClick={() => {
              setEditingPosition('artistB');
              setIsOpen(true);
            }}
          >
            <div className="artist-info">
              <span className="artist-name">
                {getArtistById(selectedArtists.artistB)?.name || '선택하세요'}
              </span>
              <span className="artist-meta">
                {getArtistById(selectedArtists.artistB)?.debut_year && 
                  `데뷔 ${getArtistById(selectedArtists.artistB).debut_year}년`}
              </span>
            </div>
            <span className="artist-color-indicator artist-color-b"></span>
          </button>
        </div>
      </div>

      {/* 아티스트 선택 모달 (접근성 개선) */}
      {isOpen && (
        <div 
          className="artist-modal-overlay" 
          onClick={handleOverlayClick}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="artist-modal" 
            onClick={e => e.stopPropagation()}
            role="document"
          >
            <div className="modal-header">
              <h3 id="modal-title">작가 선택</h3>
              <button 
                className="modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="모달 닫기"
                type="button"
              >
                ×
              </button>
            </div>

            <div className="modal-search">
              <input
                type="text"
                placeholder="작가명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
                aria-label="작가명 검색"
                role="searchbox"
              />
            </div>

            <div className="modal-list">
              {filteredArtists.map(artist => (
                <button
                  key={artist.id}
                  className="artist-list-item"
                  onClick={() => handleArtistSelect(artist.id)}
                >
                  <div className="artist-list-info">
                    <span className="artist-list-name">{artist.name}</span>
                    <span className="artist-list-meta">
                      데뷔 {artist.debut_year}년 • 종합점수 {artist.total_score}
                    </span>
                  </div>
                  <div className="artist-list-score">{artist.total_score}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistSelector;
