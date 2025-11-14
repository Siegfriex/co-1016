/**
 * CO-1016 CURATOR ODYSSEY: Navigation
 * Phase 간 네비게이션 및 URL 파라미터 파싱
 */

class Navigation {
  constructor() {
    this.routes = {
      '/': 'index.html',
      '/artist/:id': 'artist.html',
      '/artist/:id/trajectory': 'trajectory.html',
      '/compare/:artistA/:artistB': 'compare.html',
      '/artist/:id/report': 'report.html',
      '/physical-game/result': 'physical-game-result.html'
    };
  }

  // URL 파라미터 파싱
  parseParams(path, route) {
    const pathParts = path.split('/').filter(p => p);
    const routeParts = route.split('/').filter(p => p);
    
    const params = {};
    
    routeParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);
        params[paramName] = pathParts[index] || null;
      }
    });
    
    return params;
  }

  // 라우트 매칭
  matchRoute(path) {
    for (const [route, file] of Object.entries(this.routes)) {
      const routeRegex = new RegExp('^' + route.replace(/:[^/]+/g, '([^/]+)') + '$');
      if (routeRegex.test(path)) {
        const params = this.parseParams(path, route);
        return { route, file, params };
      }
    }
    
    return null;
  }

  // 네비게이션
  navigate(path) {
    const match = this.matchRoute(path);
    if (match) {
      window.location.href = match.file + (Object.keys(match.params).length > 0 
        ? '?' + new URLSearchParams(match.params).toString() 
        : '');
    } else {
      console.warn(`Route not found: ${path}`);
    }
  }

  // 현재 경로 가져오기
  getCurrentPath() {
    return window.location.pathname;
  }

  // URL 파라미터 가져오기
  getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    return result;
  }
}

// 전역 인스턴스 생성
const navigation = new Navigation();

// 전역으로 내보내기
if (typeof window !== 'undefined') {
  window.navigation = navigation;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = navigation;
}

