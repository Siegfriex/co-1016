import React from 'react';

const Header = () => {
  return (
    <header className="curator-header">
      <div className="dyss-container">
        <div className="curator-header__content">
          <div>
            <a href="/" className="curator-logo">
              CuratorOdyssey
            </a>
            <p className="curator-subtitle">
              데이터로 가치의 지도를 그립니다
            </p>
          </div>
          <nav>
            {/* 추후 네비게이션 메뉴 추가 */}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
