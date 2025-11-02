/**
 * Dr. Sarah Kim's Real Compatibility Execution Test
 * 실제 P2-P3 호환성 시스템 동작 검증 (할루시네이션 제거)
 */

// 실제 모듈 임포트 테스트
let universalDataAdapter;
try {
  universalDataAdapter = require('../adapters/universalDataAdapter.js').default;
  console.log('✅ [Import Test] universalDataAdapter 모듈 로드 성공');
} catch (error) {
  console.error('❌ [Import Error] universalDataAdapter 로드 실패:', error.message);
}

// 실제 호환성 동작 테스트 실행
export const executeRealCompatibilityTest = () => {
  const testReport = {
    test_name: 'Dr. Sarah Kim Real P2-P3 Compatibility Execution',
    timestamp: new Date().toISOString(),
    test_environment: 'CuratorOdyssey Development',
    
    // 1. 모듈 임포트 테스트
    module_imports: {
      universal_adapter: testModuleImport('../adapters/universalDataAdapter.js'),
      integration_tester: testModuleImport('../utils/integrationCompatibilityTester.js'),
      quality_validator: testModuleImport('../utils/dataQualityValidator.js'),
      time_window_rules: testModuleImport('../algorithms/timeWindowRules.js'),
      normalization_specs: testModuleImport('../algorithms/normalizationSpecs.js')
    },
    
    // 2. 실제 변환 동작 테스트
    transformation_test: null,
    
    // 3. 성능 측정
    performance_metrics: null,
    
    // 4. 호환성 검증
    compatibility_verification: null
  };
  
  // 실제 변환 테스트 수행
  if (universalDataAdapter && typeof universalDataAdapter.adaptForP3UI === 'function') {
    testReport.transformation_test = performActualTransformation();
  } else {
    testReport.transformation_test = {
      success: false,
      error: 'universalDataAdapter.adaptForP3UI 함수 없음'
    };
  }
  
  return testReport;
};

// 모듈 임포트 안전 테스트
const testModuleImport = (modulePath) => {
  try {
    const module = require(modulePath);
    return {
      success: true,
      path: modulePath,
      exports_available: Object.keys(module).length,
      main_exports: Object.keys(module).slice(0, 5) // 처음 5개만
    };
  } catch (error) {
    return {
      success: false,
      path: modulePath,
      error: error.message,
      error_type: error.code || 'UNKNOWN'
    };
  }
};

// 실제 변환 동작 수행
const performActualTransformation = () => {
  console.log('⚡ [Real Transform] 실제 P2→P3 변환 동작 테스트...');
  
  try {
    // 실제 P2 복잡 데이터
    const realP2ComplexData = {
      artist_id: 'ARTIST_TEST',
      name: 'Test Artist',
      radar5: { I: 85.5, F: 78.2, A: 91.0, M: 73.8, Sedu: 12.5 },
      sunburst_l1: { 제도: 82.7, 학술: 89.1, 담론: 76.4, 네트워크: 88.9 },
      
      // P2 복잡 메타데이터
      quality_metadata: {
        data_quality_score: 0.94,
        consistency_validation: {
          radar_sunburst_diff: 0.28,
          is_consistent: true,
          last_validated: new Date().toISOString()
        }
      },
      
      // 복잡한 시계열 구조
      timeseries: {
        bins: [
          { t: 0, v: 15.2, confidence: 0.93, events: [], metadata: { interpolated: false } },
          { t: 3, v: 28.7, confidence: 0.89, events: ['E001'], metadata: { interpolated: false } },
          { t: 8, v: 47.1, confidence: 0.91, events: ['E002', 'E003'] },
          { t: 12, v: 69.3, confidence: 0.87 },
          { t: 18, v: 82.7, confidence: 0.95 }
        ],
        analysis_metadata: {
          pattern_type: 'exponential',
          growth_rate: 0.142,
          inflection_points: [8]
        }
      }
    };
    
    const startTime = performance.now();
    
    // 실제 변환 수행
    const transformResult = universalDataAdapter.adaptForP3UI(realP2ComplexData, 'adaptive');
    
    const transformTime = performance.now() - startTime;
    
    // 변환 결과 검증
    const verification = verifyTransformationResult(transformResult, realP2ComplexData);
    
    console.log(`⏱️ [Performance] 실제 변환 시간: ${transformTime.toFixed(2)}ms`);
    console.log(`${verification.success ? '✅' : '❌'} [Verification] 변환 검증: ${verification.success ? 'PASS' : 'FAIL'}`);
    
    return {
      success: true,
      input_data_complexity: calculateDataComplexity(realP2ComplexData),
      transformation_time_ms: transformTime,
      output_data: transformResult,
      verification: verification,
      performance_grade: transformTime < 30 ? 'excellent' : 
                        transformTime < 50 ? 'good' : 'needs_optimization'
    };
    
  } catch (error) {
    console.error('❌ [Transform Error] 실제 변환 실패:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
};

// 변환 결과 검증
const verifyTransformationResult = (result, originalData) => {
  const checks = {
    has_artist_id: !!result.artist_id,
    has_name: !!result.name,
    has_radar5: result.radar5 && typeof result.radar5 === 'object',
    has_sunburst: result.sunburst_l1 && typeof result.sunburst_l1 === 'object',
    radar5_numbers: result.radar5 && Object.values(result.radar5).every(v => typeof v === 'number'),
    sunburst_numbers: result.sunburst_l1 && Object.values(result.sunburst_l1).every(v => typeof v === 'number'),
    has_metadata: !!result.metadata,
    no_undefined: !JSON.stringify(result).includes('undefined'),
    json_serializable: testJSONSerialization(result),
    adapter_metadata: !!result._adapter_metadata
  };
  
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  
  return {
    success: passedChecks === totalChecks,
    score: passedChecks / totalChecks,
    passed_checks: passedChecks,
    total_checks: totalChecks,
    detailed_checks: checks,
    critical_failures: Object.entries(checks)
      .filter(([check, passed]) => !passed && ['has_artist_id', 'has_radar5', 'has_sunburst'].includes(check))
      .map(([check, _]) => check)
  };
};

// 데이터 복잡도 계산
const calculateDataComplexity = (data) => {
  return {
    total_fields: countTotalFields(data),
    nested_levels: calculateNestingDepth(data),
    array_fields: countArrayFields(data),
    metadata_fields: Object.keys(data.quality_metadata || {}).length,
    complexity_score: calculateComplexityScore(data)
  };
};

const countTotalFields = (obj, depth = 0) => {
  if (depth > 5) return 0; // 순환 방지
  
  let count = 0;
  for (const [key, value] of Object.entries(obj)) {
    count++;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      count += countTotalFields(value, depth + 1);
    }
  }
  return count;
};

const calculateNestingDepth = (obj, currentDepth = 0) => {
  if (currentDepth > 10) return currentDepth; // 순환 방지
  
  let maxDepth = currentDepth;
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const depth = calculateNestingDepth(value, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  }
  return maxDepth;
};

const countArrayFields = (obj) => {
  let count = 0;
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) {
      count++;
    } else if (typeof value === 'object' && value !== null) {
      count += countArrayFields(value);
    }
  }
  return count;
};

const calculateComplexityScore = (data) => {
  const totalFields = countTotalFields(data);
  const nestingDepth = calculateNestingDepth(data);
  const arrayFields = countArrayFields(data);
  
  // 복잡도 점수 (0-100)
  return Math.min(100, totalFields * 2 + nestingDepth * 10 + arrayFields * 5);
};

const testJSONSerialization = (obj) => {
  try {
    const serialized = JSON.stringify(obj);
    const deserialized = JSON.parse(serialized);
    return typeof deserialized === 'object';
  } catch {
    return false;
  }
};

// 즉시 테스트 실행 (모듈 로드 시)
console.log('🧪 [Real Test] 실제 호환성 동작 테스트 시작...');
const realTestResult = executeRealCompatibilityTest();

export default realTestResult;

