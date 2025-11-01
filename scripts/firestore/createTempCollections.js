/**
 * CuratorOdyssey 임시 Firestore 컬렉션 생성
 * P1 Alex Chen - P2 독립성 확보
 * 
 * 🤝 Dr. Sarah Kim 존중 원칙:
 * - 기존 mockData.js 구조 최대한 활용
 * - P2 역할 경계 침범 절대 금지
 * - 임시 데이터는 is_temporary: true 플래그로 명시
 */

// 루트 디렉토리의 node_modules를 사용하기 위해 경로 조정
const path = require('path');
const rootDir = path.join(__dirname, '../..');

// Firebase Admin은 functions/node_modules에 있음
process.chdir(rootDir);
const admin = require(path.join(rootDir, 'functions/node_modules/firebase-admin'));

// Firebase Admin 초기화
const serviceAccount = require(path.join(rootDir, 'co-1016-firebase-adminsdk-fbsvc-ec20702062.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'co-1016'
});

const db = admin.firestore();

// Firebase 에뮬레이터 사용 (로컬 개발)
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log(`🔧 Firebase 에뮬레이터 사용: ${process.env.FIRESTORE_EMULATOR_HOST}`);
} else {
  console.log('⚠️  프로덕션 Firestore 사용 (주의!)');
  console.log('💡 로컬 테스트를 원하면: export FIRESTORE_EMULATOR_HOST="localhost:8080"');
}

console.log('🚀 CuratorOdyssey 임시 컬렉션 생성 시작...');
console.log('🤝 Dr. Sarah Kim 존중: 기존 mockData 구조 활용');

/**
 * 1. artist_summary 컬렉션 (5인 작가)
 * 기존 mockData.js의 구조 그대로 활용
 */
async function createArtistSummaryCollection() {
  console.log('\n📊 1/12: artist_summary 컬렉션 생성 중...');
  
  const artists = [
    {
      artist_id: 'ARTIST_0005',
      name: '양혜규',
      radar5: { I: 97.5, F: 90.0, A: 92.0, M: 86.0, Sedu: 9.8 },
      sunburst_l1: { 제도: 91.2, 학술: 88.0, 담론: 86.0, 네트워크: 90.0 },
      weights_version: 'AHP_v1',
      updated_at: new Date().toISOString(),
      is_temporary: true,
      data_source: 'p1_temp_collection'
    },
    {
      artist_id: 'ARTIST_0003',
      name: '이우환',
      radar5: { I: 92.5, F: 85.0, A: 87.0, M: 81.0, Sedu: 14.8 },
      sunburst_l1: { 제도: 86.2, 학술: 83.0, 담론: 81.0, 네트워크: 85.0 },
      weights_version: 'AHP_v1',
      updated_at: new Date().toISOString(),
      is_temporary: true,
      data_source: 'p1_temp_collection'
    },
    {
      artist_id: 'ARTIST_0007',
      name: '김수자',
      radar5: { I: 95.0, F: 88.0, A: 90.0, M: 84.0, Sedu: 12.0 },
      sunburst_l1: { 제도: 89.0, 학술: 86.0, 담론: 84.0, 네트워크: 88.0 },
      weights_version: 'AHP_v1',
      updated_at: new Date().toISOString(),
      is_temporary: true,
      data_source: 'p1_temp_collection'
    },
    {
      artist_id: 'ARTIST_0001',
      name: '백남준',
      radar5: { I: 100.0, F: 95.0, A: 98.0, M: 92.0, Sedu: 18.0 },
      sunburst_l1: { 제도: 96.0, 학술: 94.0, 담론: 92.0, 네트워크: 95.0 },
      weights_version: 'AHP_v1',
      updated_at: new Date().toISOString(),
      is_temporary: true,
      data_source: 'p1_temp_collection'
    },
    {
      artist_id: 'ARTIST_0009',
      name: '서도호',
      radar5: { I: 94.0, F: 87.0, A: 89.0, M: 83.0, Sedu: 11.0 },
      sunburst_l1: { 제도: 88.0, 학술: 85.0, 담론: 83.0, 네트워크: 87.0 },
      weights_version: 'AHP_v1',
      updated_at: new Date().toISOString(),
      is_temporary: true,
      data_source: 'p1_temp_collection'
    }
  ];
  
  const batch = db.batch();
  artists.forEach(artist => {
    const docRef = db.collection('artist_summary').doc(artist.artist_id);
    batch.set(docRef, artist);
  });
  
  await batch.commit();
  console.log(`✅ artist_summary: ${artists.length}인 작가 생성 완료`);
}

/**
 * 2. timeseries 컬렉션 (각 작가별 4축 시계열)
 */
async function createTimeseriesCollection() {
  console.log('\n📈 2/12: timeseries 컬렉션 생성 중...');
  
  const artists = ['ARTIST_0005', 'ARTIST_0003', 'ARTIST_0007', 'ARTIST_0001', 'ARTIST_0009'];
  const axes = ['제도', '학술', '담론', '네트워크'];
  
  const batch = db.batch();
  let count = 0;
  
  artists.forEach(artistId => {
    axes.forEach(axis => {
      const docRef = db.collection('timeseries').doc();
      batch.set(docRef, {
        artist_id: artistId,
        axis: axis,
        bins: [
          { t: 0, v: 2.1 + Math.random() * 3 },
          { t: 5, v: 18.5 + Math.random() * 5 },
          { t: 10, v: 75.3 + Math.random() * 5 },
          { t: 15, v: 90.1 + Math.random() * 3 },
          { t: 20, v: 94.0 + Math.random() * 2 }
        ],
        version: 'AHP_v1',
        is_temporary: true,
        data_source: 'p1_temp_collection'
      });
      count++;
    });
  });
  
  await batch.commit();
  console.log(`✅ timeseries: ${count}개 시계열 데이터 생성 완료`);
}

/**
 * 3. measures 컬렉션 (50개 샘플 측정값)
 */
async function createMeasuresCollection() {
  console.log('\n📏 3/12: measures 컬렉션 생성 중...');
  
  const batch = db.batch();
  const metricCodes = [
    'EXH_FREQ_TIER_S', 'EXH_FREQ_TIER_A', 'EXH_FREQ_TIER_B',
    'FAIR_FREQ_TIER_S', 'FAIR_FREQ_TIER_A',
    'AWARD_MAJOR', 'AWARD_REGIONAL',
    'MEDIA_COVERAGE_TIER_1', 'MEDIA_COVERAGE_TIER_2',
    'EDU_INSTITUTIONAL'
  ];
  
  for (let i = 0; i < 50; i++) {
    const docRef = db.collection('measures').doc();
    batch.set(docRef, {
      entity_id: `ARTIST_000${(i % 5) + 1}`,
      axis: ['제도', '학술', '담론', '네트워크'][i % 4],
      metric_code: metricCodes[i % metricCodes.length],
      value_raw: Math.random() * 100,
      value_normalized: null, // fnBatchNormalize가 채울 예정
      source_id: `SRC_TEMP_${i}`,
      is_temporary: true,
      data_source: 'p1_temp_collection'
    });
  }
  
  await batch.commit();
  console.log('✅ measures: 50개 측정값 생성 완료');
}

/**
 * 4. weights 컬렉션 (AHP_v1 가중치)
 */
async function createWeightsCollection() {
  console.log('\n⚖️  4/12: weights 컬렉션 생성 중...');
  
  const weights = [
    { axis: '제도', metric_code: 'EXH_FREQ_TIER_S', value: 0.50, version: 'AHP_v1' },
    { axis: '제도', metric_code: 'EXH_FREQ_TIER_A', value: 0.30, version: 'AHP_v1' },
    { axis: '학술', metric_code: 'AWARD_MAJOR', value: 0.40, version: 'AHP_v1' },
    { axis: '담론', metric_code: 'MEDIA_COVERAGE_TIER_1', value: 0.45, version: 'AHP_v1' },
    { axis: '네트워크', metric_code: 'FAIR_FREQ_TIER_S', value: 0.35, version: 'AHP_v1' }
  ];
  
  const batch = db.batch();
  weights.forEach((weight, index) => {
    const docRef = db.collection('weights').doc(`WEIGHT_${index + 1}`);
    batch.set(docRef, {
      ...weight,
      is_temporary: true,
      data_source: 'p1_temp_collection'
    });
  });
  
  await batch.commit();
  console.log(`✅ weights: ${weights.length}개 가중치 생성 완료`);
}

/**
 * 5. codebook 컬렉션 (20개 핵심 metric_code)
 */
async function createCodebookCollection() {
  console.log('\n📖 5/12: codebook 컬렉션 생성 중...');
  
  const codebook = [
    { metric_code: 'EXH_FREQ_TIER_S', axis: '제도', definition: 'Tier-S 기관 전시 빈도', unit: 'count', time_window_default: '10y(1.0/0.5)', normalization: 'pct' },
    { metric_code: 'EXH_FREQ_TIER_A', axis: '제도', definition: 'Tier-A 기관 전시 빈도', unit: 'count', time_window_default: '10y(1.0/0.5)', normalization: 'pct' },
    { metric_code: 'FAIR_FREQ_TIER_S', axis: '네트워크', definition: 'Tier-S 페어 참여 빈도', unit: 'count', time_window_default: 'cumulative', normalization: 'pct' },
    { metric_code: 'AWARD_MAJOR', axis: '학술', definition: '주요 수상', unit: 'count', time_window_default: 'cumulative+recent_5y_weight', normalization: 'pct' },
    { metric_code: 'MEDIA_COVERAGE_TIER_1', axis: '담론', definition: 'Tier-1 미디어 보도', unit: 'count', time_window_default: '24months', normalization: 'pct' }
  ];
  
  const batch = db.batch();
  codebook.forEach(entry => {
    const docRef = db.collection('codebook').doc(entry.metric_code);
    batch.set(docRef, {
      ...entry,
      is_temporary: true,
      data_source: 'p1_temp_collection'
    });
  });
  
  await batch.commit();
  console.log(`✅ codebook: ${codebook.length}개 메트릭 정의 생성 완료`);
}

/**
 * 6-12. 나머지 컬렉션들 (최소 구조만)
 */
async function createRemainingCollections() {
  console.log('\n🗂️  6-12/12: 나머지 컬렉션 생성 중...');
  
  const collections = [
    'entities', 'events', 'axis_map', 'edges', 
    'sources', 'snapshots', 'compare_pairs'
  ];
  
  for (const collectionName of collections) {
    const docRef = db.collection(collectionName).doc('PLACEHOLDER');
    await docRef.set({
      _placeholder: true,
      _message: `P2 Dr. Sarah Kim 데이터 대기 중`,
      is_temporary: true,
      data_source: 'p1_temp_collection',
      created_at: new Date().toISOString()
    });
    console.log(`✅ ${collectionName}: 플레이스홀더 생성 완료`);
  }
}

/**
 * 전체 실행 함수
 */
async function main() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 P1 Alex Chen - 임시 컬렉션 생성 시작');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await createArtistSummaryCollection();
    await createTimeseriesCollection();
    await createMeasuresCollection();
    await createWeightsCollection();
    await createCodebookCollection();
    await createRemainingCollections();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 12개 컬렉션 생성 완료!');
    console.log('🤝 P2 Dr. Sarah Kim 실제 데이터 준비 시 즉시 전환 가능');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 생성된 컬렉션 요약:');
    console.log('  1. artist_summary: 5인 작가 (양혜규, 이우환, 김수자, 백남준, 서도호)');
    console.log('  2. timeseries: 20개 시계열 (5인 x 4축)');
    console.log('  3. measures: 50개 샘플 측정값');
    console.log('  4. weights: 5개 AHP_v1 가중치');
    console.log('  5. codebook: 5개 핵심 메트릭 정의');
    console.log('  6-12. 나머지 7개 컬렉션 (플레이스홀더)');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main();
}

module.exports = { main };

