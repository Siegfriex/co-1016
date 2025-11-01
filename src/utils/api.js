// API 유틸리티 함수들

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// API 호출 헬퍼
export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Phase 1 API 엔드포인트들
export const artistAPI = {
  // GET /api/artist/:id/summary
  getSummary: (artistId) => 
    apiCall(`/artist/${artistId}/summary`),

  // GET /api/artist/:id/sunburst
  getSunburst: (artistId) => 
    apiCall(`/artist/${artistId}/sunburst`),

  // GET /api/artist/:id/timeseries/:axis
  getTimeseries: (artistId, axis) => 
    apiCall(`/artist/${artistId}/timeseries/${axis}`),

  // GET /api/compare/:A/:B/:axis
  getComparison: (artistA, artistB, axis) => 
    apiCall(`/compare/${artistA}/${artistB}/${axis}`)
};

// AI 보고서 API (Phase 2 예정)
export const reportAPI = {
  // POST /api/report/generate
  generateReport: (data) => 
    apiCall('/report/generate', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

export default { artistAPI, reportAPI };
