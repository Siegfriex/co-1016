/**
 * P3 Maya Chen UI 호환성 실제 테스트
 * Dr. Sarah Kim's Universal Data Adapter 검증
 */

import { universalDataAdapter } from '../adapters/universalDataAdapter';

// Maya Chen useConditionalData.js 정확한 기대 구조 테스트
const testP3UICompatibility = () => {
  console.log('🔬 [P3 Compatibility Test] Maya Chen UI 호환성 검증 시작...');
  
  // 1. useConditionalData.js 라인 9-14 구조 테스트
  const mockP2ComplexData = {
    artist_id: 'ARTIST_0005',
    name: '양혜규',
    radar5: { I: 97.5, F: 90.0, A: 92.0, M: 86.0, Sedu: 9.8 },
    sunburst_l1: { 제도: 91.2, 학술: 88.0, 담론: 86.0, 네트워크: 90.0 },
    // P2 복잡한 메타데이터 추가
    quality_metadata: {
      data_quality_score: 0.95,
      consistency_validation: { is_consistent: true, radar_sunburst_diff: 0.3 }
    },
    timeseries: {
      bins: [
        { t: 0, v: 12.5, confidence: 0.95, statistical_metadata: { growth_rate: 0.15 } },
        { t: 5, v: 34.7, confidence: 0.88, events: ['EVENT_001'] }
      ],
      analysis_metadata: { pattern_type: 'exponential' }
    }
  };
  
  // 2. Universal Adapter 변환 테스트
  const adaptedData = universalDataAdapter.adaptForP3UI(mockP2ComplexData);
  
  // 3. Maya Chen useConditionalData.js 시뮬레이션
  const mayaChenDataStructure = {
    phase1: adaptedData,  // 라인 10
    phase2: adaptedData.phase2 || adaptedData.timeseries,  // 라인 11
    phase3: adaptedData.phase3 || adaptedData.comparison,  // 라인 12
    phase4: null  // 라인 13
  };
  
  // 4. 필수 필드 검증
  const validationResults = {
    artist_id: !!mayaChenDataStructure.phase1?.artist_id,
    name: !!mayaChenDataStructure.phase1?.name,
    radar5_complete: validateRadar5Structure(mayaChenDataStructure.phase1?.radar5),
    sunburst_complete: validateSunburstStructure(mayaChenDataStructure.phase1?.sunburst_l1),
    timeseries_safe: validateTimeseriesStructure(mayaChenDataStructure.phase2),
    no_parsing_errors: validateNoParsingErrors(mayaChenDataStructure)
  };
  
  const allTestsPassed = Object.values(validationResults).every(Boolean);
  
  console.log(`${allTestsPassed ? '✅' : '❌'} [P3 Compatibility] Maya Chen UI 호환성: ${allTestsPassed ? 'PASS' : 'FAIL'}`);
  console.log('📊 [Details]:', validationResults);
  
  return {
    compatibility_verified: allTestsPassed,
    test_results: validationResults,
    adapted_structure: mayaChenDataStructure,
    original_p2_data: mockP2ComplexData
  };
};

const validateRadar5Structure = (radar5) => {
  if (!radar5) return false;
  const requiredKeys = ['I', 'F', 'A', 'M', 'Sedu'];
  return requiredKeys.every(key => 
    typeof radar5[key] === 'number' && !isNaN(radar5[key])
  );
};

const validateSunburstStructure = (sunburst) => {
  if (!sunburst) return false;
  const requiredKeys = ['제도', '학술', '담론', '네트워크'];
  return requiredKeys.every(key => 
    typeof sunburst[key] === 'number' && !isNaN(sunburst[key])
  );
};

const validateTimeseriesStructure = (timeseries) => {
  if (!timeseries) return true; // 선택적이므로 없어도 OK
  if (!timeseries.bins || !Array.isArray(timeseries.bins)) return false;
  
  return timeseries.bins.every(bin => 
    typeof bin.t === 'number' && typeof bin.v === 'number' &&
    !isNaN(bin.t) && !isNaN(bin.v)
  );
};

const validateNoParsingErrors = (structure) => {
  try {
    JSON.stringify(structure); // JSON 직렬화 가능 여부 테스트
    return true;
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    return false;
  }
};

// 테스트 실행
export const runP3CompatibilityValidation = testP3UICompatibility;
export default testP3UICompatibility;

