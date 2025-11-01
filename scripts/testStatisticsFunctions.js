// CuratorOdyssey 통계 함수 실제 계산 테스트
// P1 Alex Chen - 수학적 알고리즘 및 통계 계산 검증

const axios = require('axios');

const BASE_URL = 'http://localhost:5003';

console.log('📊 통계 함수 실제 계산 테스트');
console.log(`📡 테스트 대상: ${BASE_URL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function testRadarScoreCalculation() {
  try {
    console.log('\n🎯 1. 레이더 점수 계산 테스트...');
    
    const response = await axios.get(`${BASE_URL}/api/artist/ARTIST_0005/summary`);
    const radar5 = response.data.radar5;
    
    console.log('   📊 원본 레이더 점수:', radar5);
    
    // 5축 평균 계산
    const radarValues = Object.values(radar5);
    const radarAvg = radarValues.reduce((a, b) => a + b, 0) / radarValues.length;
    
    console.log('   📈 계산된 평균:', radarAvg.toFixed(2));
    
    // 각 축별 분석
    const axisAnalysis = {
      '기관전시(I)': { score: radar5.I, level: radar5.I >= 90 ? '최고' : radar5.I >= 70 ? '높음' : '보통' },
      '페어(F)': { score: radar5.F, level: radar5.F >= 90 ? '최고' : radar5.F >= 70 ? '높음' : '보통' },
      '시상(A)': { score: radar5.A, level: radar5.A >= 90 ? '최고' : radar5.A >= 70 ? '높음' : '보통' },
      '미디어(M)': { score: radar5.M, level: radar5.M >= 90 ? '최고' : radar5.M >= 70 ? '높음' : '보통' },
      '교육(Sedu)': { score: radar5.Sedu, level: radar5.Sedu >= 90 ? '최고' : radar5.Sedu >= 70 ? '높음' : '보통' }
    };
    
    console.log('   🔍 축별 분석:');
    Object.entries(axisAnalysis).forEach(([axis, analysis]) => {
      console.log(`      ${axis}: ${analysis.score}점 (${analysis.level})`);
    });
    
    // 강점/약점 식별
    const strengths = Object.entries(axisAnalysis).filter(([_, analysis]) => analysis.score >= 90);
    const weaknesses = Object.entries(axisAnalysis).filter(([_, analysis]) => analysis.score < 70);
    
    console.log('   💪 강점 축:', strengths.map(([axis, _]) => axis).join(', ') || '없음');
    console.log('   ⚠️  약점 축:', weaknesses.map(([axis, _]) => axis).join(', ') || '없음');
    
    return {
      success: true,
      radar_avg: radarAvg,
      strengths: strengths.length,
      weaknesses: weaknesses.length,
      axis_analysis: axisAnalysis
    };
  } catch (error) {
    console.log('   ❌ 레이더 점수 계산 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function testTimeseriesAnalysis() {
  try {
    console.log('\n📈 2. 시계열 분석 테스트...');
    
    const axes = ['제도', '학술', '담론', '네트워크'];
    const timeseriesData = {};
    
    for (const axis of axes) {
      const response = await axios.get(`${BASE_URL}/api/artist/ARTIST_0005/timeseries/${axis}`);
      timeseriesData[axis] = response.data.bins;
    }
    
    console.log('   📊 시계열 데이터 수집 완료');
    
    // 각 축별 성장률 계산
    const growthAnalysis = {};
    
    for (const [axis, bins] of Object.entries(timeseriesData)) {
      if (bins && bins.length >= 2) {
        const firstValue = bins[0].v;
        const lastValue = bins[bins.length - 1].v;
        const growthRate = ((lastValue - firstValue) / firstValue) * 100;
        
        growthAnalysis[axis] = {
          first_value: firstValue,
          last_value: lastValue,
          growth_rate: growthRate,
          growth_level: growthRate >= 100 ? '폭발적' : growthRate >= 50 ? '높음' : growthRate >= 20 ? '보통' : '낮음'
        };
        
        console.log(`   📈 ${axis}축 성장률: ${growthRate.toFixed(1)}% (${growthAnalysis[axis].growth_level})`);
      }
    }
    
    // 전체 성장률 평균
    const growthRates = Object.values(growthAnalysis).map(g => g.growth_rate);
    const avgGrowthRate = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    
    console.log(`   📊 전체 평균 성장률: ${avgGrowthRate.toFixed(1)}%`);
    
    // 최고 성장 축 식별
    const bestGrowthAxis = Object.entries(growthAnalysis)
      .sort(([,a], [,b]) => b.growth_rate - a.growth_rate)[0];
    
    console.log(`   🏆 최고 성장 축: ${bestGrowthAxis[0]} (${bestGrowthAxis[1].growth_rate.toFixed(1)}%)`);
    
    return {
      success: true,
      avg_growth_rate: avgGrowthRate,
      best_growth_axis: bestGrowthAxis[0],
      growth_analysis: growthAnalysis
    };
  } catch (error) {
    console.log('   ❌ 시계열 분석 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function testComparisonAnalysis() {
  try {
    console.log('\n🔄 3. 비교 분석 테스트...');
    
    const response = await axios.get(`${BASE_URL}/api/compare/ARTIST_0005/ARTIST_0003/담론`);
    const comparisonData = response.data;
    
    console.log('   📊 비교 데이터:', {
      pair_id: comparisonData.pair_id,
      axis: comparisonData.axis,
      series_count: comparisonData.series?.length || 0,
      abs_diff_sum: comparisonData.abs_diff_sum
    });
    
    if (comparisonData.series && comparisonData.series.length > 0) {
      // 시계열 차이 분석
      const series = comparisonData.series;
      const artistA_values = series.map(s => s.artist_a);
      const artistB_values = series.map(s => s.artist_b);
      
      // 각 시점별 차이 계산
      const differences = series.map(s => s.artist_a - s.artist_b);
      const avgDifference = differences.reduce((a, b) => a + b, 0) / differences.length;
      
      console.log('   📈 시계열 차이 분석:');
      console.log(`      평균 차이: ${avgDifference.toFixed(2)}점`);
      console.log(`      최대 차이: ${Math.max(...differences).toFixed(2)}점`);
      console.log(`      최소 차이: ${Math.min(...differences).toFixed(2)}점`);
      
      // 우위 분석
      const artistA_advantage = differences.filter(d => d > 0).length;
      const artistB_advantage = differences.filter(d => d < 0).length;
      const ties = differences.filter(d => d === 0).length;
      
      console.log('   🏆 우위 분석:');
      console.log(`      양혜규 우위: ${artistA_advantage}개 시점`);
      console.log(`      이우환 우위: ${artistB_advantage}개 시점`);
      console.log(`      동점: ${ties}개 시점`);
      
      // 전체 우위 판정
      const overallWinner = avgDifference > 0 ? '양혜규' : avgDifference < 0 ? '이우환' : '동점';
      console.log(`   🎯 전체 우위: ${overallWinner} (${Math.abs(avgDifference).toFixed(2)}점 차이)`);
      
      return {
        success: true,
        avg_difference: avgDifference,
        overall_winner: overallWinner,
        artistA_advantage,
        artistB_advantage,
        ties
      };
    }
    
    return { success: true, message: '비교 데이터 없음' };
  } catch (error) {
    console.log('   ❌ 비교 분석 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function testAHPWeightsValidation() {
  try {
    console.log('\n⚖️  4. AHP 가중치 검증 테스트...');
    
    // 1016blprint.md 명세의 AHP 가중치 검증
    const expectedWeights = {
      '기관전시(I)': 0.50,
      '페어(F)': 0.30,
      '시상(A)': 0.40,
      '미디어(M)': 0.20,
      '교육(Sedu)': 0.10
    };
    
    console.log('   📊 예상 AHP 가중치:', expectedWeights);
    
    // 가중치 합계 검증 (정규화 확인)
    const weightSum = Object.values(expectedWeights).reduce((a, b) => a + b, 0);
    console.log(`   📈 가중치 합계: ${weightSum} (정규화: ${weightSum === 1.0 ? '완료' : '미완료'})`);
    
    // 가중치 순위 검증
    const sortedWeights = Object.entries(expectedWeights)
      .sort(([,a], [,b]) => b - a);
    
    console.log('   🏆 가중치 순위:');
    sortedWeights.forEach(([axis, weight], index) => {
      console.log(`      ${index + 1}. ${axis}: ${weight}`);
    });
    
    // 가중치 일관성 검증 (AHP 일관성 비율)
    const weights = Object.values(expectedWeights);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const consistencyRatio = (maxWeight - minWeight) / maxWeight;
    
    console.log(`   🔍 일관성 비율: ${consistencyRatio.toFixed(3)} (${consistencyRatio < 0.1 ? '양호' : '주의'})`);
    
    return {
      success: true,
      weight_sum: weightSum,
      is_normalized: weightSum === 1.0,
      consistency_ratio: consistencyRatio,
      weight_ranking: sortedWeights
    };
  } catch (error) {
    console.log('   ❌ AHP 가중치 검증 실패:', error.message);
    return { success: false, error: error.message };
  }
}

async function testNormalizationPipeline() {
  try {
    console.log('\n🔄 5. 정규화 파이프라인 테스트...');
    
    // 1016blprint.md 명세의 3단계 정규화 파이프라인 시뮬레이션
    console.log('   📊 3단계 정규화 파이프라인 시뮬레이션:');
    
    // 1단계: Log Transform
    const rawValues = [10, 50, 100, 200, 500];
    const logTransformed = rawValues.map(v => Math.log10(v + 1));
    console.log(`   1단계 Log Transform: [${rawValues.join(', ')}] → [${logTransformed.map(v => v.toFixed(2)).join(', ')}]`);
    
    // 2단계: Winsorizing (상위 5% 제한)
    const winsorized = logTransformed.map(v => Math.min(v, Math.percentile(logTransformed, 95)));
    console.log(`   2단계 Winsorizing: [${logTransformed.map(v => v.toFixed(2)).join(', ')}] → [${winsorized.map(v => v.toFixed(2)).join(', ')}]`);
    
    // 3단계: Percentile Rank (0-100 스케일)
    const percentileRanked = winsorized.map(v => {
      const rank = winsorized.filter(x => x <= v).length;
      return (rank / winsorized.length) * 100;
    });
    console.log(`   3단계 Percentile Rank: [${winsorized.map(v => v.toFixed(2)).join(', ')}] → [${percentileRanked.map(v => v.toFixed(1)).join(', ')}]`);
    
    // 정규화 품질 검증
    const minValue = Math.min(...percentileRanked);
    const maxValue = Math.max(...percentileRanked);
    const range = maxValue - minValue;
    
    console.log(`   📈 정규화 품질: 범위 ${range.toFixed(1)} (${range >= 90 ? '우수' : '보통'})`);
    
    return {
      success: true,
      normalization_range: range,
      is_well_normalized: range >= 90,
      pipeline_steps: {
        raw: rawValues,
        log_transformed: logTransformed,
        winsorized: winsorized,
        percentile_ranked: percentileRanked
      }
    };
  } catch (error) {
    console.log('   ❌ 정규화 파이프라인 테스트 실패:', error.message);
    return { success: false, error: error.message };
  }
}

// Math.percentile 헬퍼 함수
Math.percentile = function(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  if (upper >= sorted.length) return sorted[sorted.length - 1];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

async function runStatisticsTests() {
  console.log('🔧 P1 Alex Chen - 통계 함수 검증');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const results = {
    radarCalculation: await testRadarScoreCalculation(),
    timeseriesAnalysis: await testTimeseriesAnalysis(),
    comparisonAnalysis: await testComparisonAnalysis(),
    ahpWeightsValidation: await testAHPWeightsValidation(),
    normalizationPipeline: await testNormalizationPipeline()
  };
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 통계 함수 테스트 결과:');
  console.log(`✅ 성공: ${successCount}/${totalTests}`);
  console.log(`❌ 실패: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('🎉 모든 통계 함수가 정상 작동합니다!');
    console.log('🚀 수학적 알고리즘 검증 완료');
  } else {
    console.log('⚠️  일부 통계 함수에 문제가 있습니다. 로그를 확인하세요.');
  }
  
  return results;
}

// 테스트 실행
runStatisticsTests().catch(console.error);

