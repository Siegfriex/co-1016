import { useState, useEffect } from 'react';
import { mockArtistSummary, mockSunburstData } from '../utils/mockData';

// 실제 프로덕션에서는 React Query나 SWR 사용 예정
export const useArtistData = (artistId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 실제 API 호출 시:
        // const response = await fetch(`/api/artist/${artistId}/summary`);
        // const result = await response.json();
        
        // 목업 데이터 사용 (로딩 시뮬레이션)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setData({
          summary: mockArtistSummary,
          sunburst: mockSunburstData
        });
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (artistId) {
      fetchData();
    }
  }, [artistId]);

  return { data, loading, error };
};

export default useArtistData;
