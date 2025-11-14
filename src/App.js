import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import ArtistPhase1View from './components/layout/ArtistPhase1View';
import ArtistPhase2View from './components/layout/ArtistPhase2View';
import ArtistPhase3View from './components/layout/ArtistPhase3View';
import ArtistPhase4View from './components/layout/ArtistPhase4View';
import PhysicalGameResultView from './components/physical-game/PhysicalGameResultView';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/globals.css';
import './styles/components.css';
import './styles/report.css';

function App() {
  // Phase 전환 상태 관리 (Maya Chen's Comparative Analysis Design)
  const [currentPhase, setCurrentPhase] = useState(1);
  const [currentArtistId, setCurrentArtistId] = useState("ARTIST_0005");

  // Phase 1 → 2 드릴다운 핸들러
  const handleDrilldownToPhase2 = (artistId = currentArtistId) => {
    setCurrentArtistId(artistId);
    setCurrentPhase(2);
    
    // 부드러운 전환 효과를 위한 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Phase 2 → 1 복귀 핸들러
  const handleBackToPhase1 = () => {
    setCurrentPhase(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Phase 2 → 3 비교 분석 핸들러
  const handleDrilldownToPhase3 = (artistId = currentArtistId) => {
    setCurrentArtistId(artistId);
    setCurrentPhase(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Phase 3 → 2 복귀 핸들러
  const handleBackToPhase2 = () => {
    setCurrentPhase(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Phase 4 진입 핸들러
  const handleDrilldownToPhase4 = (artistId = currentArtistId) => {
    setCurrentArtistId(artistId);
    setCurrentPhase(4);
    // /artist/:id/report 경로로 리다이렉트
    window.location.href = `/artist/${artistId}/report`;
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route 
                path="/" 
                element={
                  currentPhase === 1 ? (
                    <ArtistPhase1View 
                      artistId={currentArtistId}
                      onDrilldownToPhase2={handleDrilldownToPhase2}
                    />
                  ) : currentPhase === 2 ? (
                    <ArtistPhase2View 
                      artistId={currentArtistId}
                      onBackToPhase1={handleBackToPhase1}
                      onDrilldownToPhase3={handleDrilldownToPhase3}
                    />
                  ) : (
                    <ArtistPhase3View 
                      onBackToPhase2={handleBackToPhase2}
                    />
                  )
                }
              />
              <Route 
                path="/artist/:id" 
                element={
                  currentPhase === 1 ? (
                    <ArtistPhase1View 
                      onDrilldownToPhase2={handleDrilldownToPhase2}
                    />
                  ) : currentPhase === 2 ? (
                    <ArtistPhase2View 
                      onBackToPhase1={handleBackToPhase1}
                      onDrilldownToPhase3={handleDrilldownToPhase3}
                    />
                  ) : (
                    <ArtistPhase3View 
                      onBackToPhase2={handleBackToPhase2}
                    />
                  )
                }
              />
              {/* Phase 2 직접 접근 라우트 */}
              <Route 
                path="/artist/:id/trajectory"
                element={
                  <ArtistPhase2View 
                    onBackToPhase1={handleBackToPhase1}
                    onDrilldownToPhase3={handleDrilldownToPhase3}
                  />
                }
              />
              {/* Phase 3 직접 접근 라우트 */}
              <Route 
                path="/artist/:id/compare"
                element={
                  <ArtistPhase3View 
                    onBackToPhase2={handleBackToPhase2}
                  />
                }
              />
              {/* Phase 3 비교 분석 라우트 */}
              <Route 
                path="/compare/:artistA/:artistB"
                element={
                  <ArtistPhase3View 
                    onBackToPhase2={handleBackToPhase2}
                    onDrilldownToPhase4={handleDrilldownToPhase4}
                  />
                }
              />
              {/* Phase 4 종합 분석 라우트 */}
              <Route 
                path="/artist/:id/report"
                element={
                  <ArtistPhase4View 
                    artistId={currentArtistId}
                    onBackToPhase1={() => setCurrentPhase(1)}
                  />
                }
              />
              {/* 피지컬 게임 결과 화면 라우트 */}
              <Route 
                path="/physical-game/result"
                element={<PhysicalGameResultView />}
              />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
