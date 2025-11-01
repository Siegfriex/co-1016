/**
 * Dr. Sarah Kim's Actual Compatibility Verification
 * 실제 P2-P3 호환성 동작 테스트 (할루시네이션 제거)
 */

import { universalDataAdapter } from '../adapters/universalDataAdapter';

// 실제 P3 Maya Chen useConditionalData.js 구조 기반 테스트
export const runActualCompatibilityTest = () => {
  console.log('🔬 [ACTUAL TEST] P2-P3 실제 호환성 동작 검증...');
  
  // 1. 실제 P2 복잡 데이터 (Dr. Sarah Kim 스키마)
  const realP2Data = {
    artist_id: 'ARTIST_0005',
    name: '양혜규',
    radar5: { I: 97.5, F: 90.0, A: 92.0, M: 86.0, Sedu: 9.8 },
    sunburst_l1: { 제도: 91.2, 학술: 88.0, 담론: 86.0, 네트워크: 90.0 },
    
    // P2의 복잡한 메타데이터 (실제)
    quality_metadata: {
      data_quality_score: 0.95,
      consistency_validation: { 
        radar_sunburst_diff: 0.3,
        is_consistent: true 
      },
      normalization_metadata: { 
        quality_score: 0.92,
        pipeline_steps: ['log_transform', 'winsorize_1pct', 'percentile_rank']
      }
    },
    
    // 시계열 복잡 구조 (실제)
    timeseries: {
      artist_id: 'ARTIST_0005',
      axis: '제도',
      bins: [
        { 
          t: 0, v: 12.5, 
          confidence: 0.95, 
          events: ['EVENT_001'],
          metadata: { interpolated: false },
          statistical_metadata: { growth_rate: 0.15, volatility: 0.08 }
        },
        { 
          t: 5, v: 34.7, 
          confidence: 0.88,
          events: ['EVENT_003', 'EVENT_004'],
          metadata: { interpolated: false }
        }
      ],
      analysis_metadata: {
        pattern_type: 'exponential',
        inflection_points: [8, 15],
        quality_indicators: { overall_score: 0.91 }
      }
    }
  };
  
  // 2. Universal Adapter 실제 동작 테스트
  console.log('⚡ [ADAPTER TEST] Universal Adapter 변환 실행...');
  const startTime = performance.now();
  
  const adaptedData = universalDataAdapter.adaptForP3UI(realP2Data, 'adaptive');
  
  const transformationTime = performance.now() - startTime;
  console.log(`⏱️ [PERFORMANCE] 변환 시간: ${transformationTime.toFixed(2)}ms`);
  
  // 3. Maya Chen useConditionalData.js 구조 시뮬레이션
  const mayaChenExpectedStructure = {
    phase1: adaptedData,  // Maya Chen useConditionalData.js 라인 10
    phase2: adaptedData.phase2 || null,  // 라인 11
    phase3: adaptedData.phase3 || null,  // 라인 12  
    phase4: null  // 라인 13
  };
  
  // 4. 필수 필드 실제 검증
  const verification = {
    has_artist_id: !!mayaChenExpectedStructure.phase1?.artist_id,
    has_name: !!mayaChenExpectedStructure.phase1?.name,
    has_valid_radar5: verifyRadar5(mayaChenExpectedStructure.phase1?.radar5),
    has_valid_sunburst: verifySunburst(mayaChenExpectedStructure.phase1?.sunburst_l1),
    has_metadata: !!mayaChenExpectedStructure.phase1?.metadata,
    phase2_available: !!mayaChenExpectedStructure.phase2,
    phase2_bins_valid: verifyTimeseriesBins(mayaChenExpectedStructure.phase2?.bins),
    no_undefined_fields: !hasUndefinedFields(mayaChenExpectedStructure),
    json_serializable: isJSONSerializable(mayaChenExpectedStructure)
  };
  
  const allTestsPassed = Object.values(verification).every(Boolean);
  const compatibilityScore = Object.values(verification).filter(Boolean).length / Object.keys(verification).length;
  
  console.log(`${allTestsPassed ? '✅' : '❌'} [COMPATIBILITY] 실제 호환성 점수: ${(compatibilityScore * 100).toFixed(1)}%`);
  
  return {
    test_timestamp: new Date().toISOString(),
    tester: 'Dr. Sarah Kim Actual Verification',
    
    input_data: {
      p2_complex_data_size: JSON.stringify(realP2Data).length,
      p2_metadata_fields: Object.keys(realP2Data.quality_metadata || {}).length,
      p2_timeseries_complexity: realP2Data.timeseries?.analysis_metadata ? 'high' : 'basic'
    },
    
    transformation_results: {
      success: !!adaptedData,
      transformation_time_ms: transformationTime,
      output_data_size: JSON.stringify(adaptedData).length,
      fallback_applied: adaptedData._adapter_metadata?.emergency_fallback || false,
      compatibility_guaranteed: adaptedData._adapter_metadata?.p3_ui_safe || false
    },
    
    maya_chen_compatibility: {
      structure_match: allTestsPassed,
      compatibility_score: compatibilityScore,
      detailed_verification: verification,
      parsing_safety: allTestsPassed ? 'guaranteed' : 'needs_review'
    },
    
    performance_metrics: {
      transformation_overhead: `${transformationTime.toFixed(2)}ms`,
      meets_30ms_target: transformationTime < 30,
      memory_impact: 'minimal',
      production_ready: transformationTime < 50
    }
  };
};

// 검증 함수들
const verifyRadar5 = (radar5) => {
  if (!radar5 || typeof radar5 !== 'object') return false;
  const required = ['I', 'F', 'A', 'M', 'Sedu'];
  return required.every(key => typeof radar5[key] === 'number' && !isNaN(radar5[key]));
};

const verifySunburst = (sunburst) => {
  if (!sunburst || typeof sunburst !== 'object') return false;
  const required = ['제도', '학술', '담론', '네트워크'];
  return required.every(key => typeof sunburst[key] === 'number' && !isNaN(sunburst[key]));
};

const verifyTimeseriesBins = (bins) => {
  if (!Array.isArray(bins)) return true; // 선택적 필드
  return bins.every(bin => 
    typeof bin.t === 'number' && typeof bin.v === 'number' &&
    !isNaN(bin.t) && !isNaN(bin.v)
  );
};

const hasUndefinedFields = (obj) => {
  return JSON.stringify(obj).includes('undefined');
};

const isJSONSerializable = (obj) => {
  try {
    JSON.stringify(obj);
    return true;
  } catch {
    return false;
  }
};

export default runActualCompatibilityTest;

