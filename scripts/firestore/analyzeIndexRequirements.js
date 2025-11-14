#!/usr/bin/env node
/**
 * Firestore 인덱스 요구사항 분석 스크립트
 * 
 * 코드베이스의 쿼리 패턴과 문서 명세를 분석하여 누락된 인덱스를 식별합니다.
 */

const fs = require('fs');
const path = require('path');

// 현재 인덱스 로드
const currentIndexesPath = path.join(__dirname, '../../firestore.indexes.json');
const currentIndexes = JSON.parse(fs.readFileSync(currentIndexesPath, 'utf8'));

// 쿼리 패턴 분석 결과 (코드베이스에서 수집)
const codeQueryPatterns = [
  // measures 컬렉션
  {
    collection: 'measures',
    pattern: {
      where: ['entity_id', 'axis'],
      orderBy: 'time_window',
      usage: 'fnBatchTimeseries, timeWindowRules.js',
      priority: 'HIGH'
    },
    requiredIndex: {
      fields: [
        { fieldPath: 'entity_id', order: 'ASCENDING' },
        { fieldPath: 'axis', order: 'ASCENDING' },
        { fieldPath: 'time_window', order: 'ASCENDING' }
      ]
    }
  },
  {
    collection: 'measures',
    pattern: {
      where: ['entity_id', 'axis', 'value_normalized'],
      orderBy: 'time_window',
      usage: 'P1_BATCH_IMPLEMENTATION_GUIDE.md fnBatchTimeseries',
      priority: 'HIGH'
    },
    requiredIndex: {
      fields: [
        { fieldPath: 'entity_id', order: 'ASCENDING' },
        { fieldPath: 'axis', order: 'ASCENDING' },
        { fieldPath: 'value_normalized', order: 'ASCENDING' },
        { fieldPath: 'time_window', order: 'ASCENDING' }
      ]
    }
  },
  {
    collection: 'measures',
    pattern: {
      where: ['entity_id'],
      usage: 'functions/src/api/index.js generateSunburstFromMeasures',
      priority: 'MEDIUM'
    },
    requiredIndex: {
      fields: [
        { fieldPath: 'entity_id', order: 'ASCENDING' }
      ]
    }
  },
  
  // timeseries 컬렉션
  {
    collection: 'timeseries',
    pattern: {
      where: ['artist_id', 'axis'],
      usage: 'functions/src/api/index.js getArtistTimeseries',
      priority: 'HIGH'
    },
    requiredIndex: {
      fields: [
        { fieldPath: 'artist_id', order: 'ASCENDING' },
        { fieldPath: 'axis', order: 'ASCENDING' }
      ]
    }
  },
  {
    collection: 'timeseries',
    pattern: {
      where: ['artist_id', 'axis'],
      orderBy: 'version',
      orderDirection: 'DESC',
      usage: '1102blueprint.md getBatchTimeseries, SRD.md Section 13.2',
      priority: 'HIGH'
    },
    requiredIndex: {
      fields: [
        { fieldPath: 'artist_id', order: 'ASCENDING' },
        { fieldPath: 'axis', order: 'ASCENDING' },
        { fieldPath: 'version', order: 'DESCENDING' }
      ]
    }
  },
  
  // compare_pairs 컬렉션
  {
    collection: 'compare_pairs',
    pattern: {
      where: ['pair_id', 'axis'],
      usage: 'functions/src/api/index.js getCompareArtists',
      priority: 'HIGH'
    },
    requiredIndex: {
      fields: [
        { fieldPath: 'pair_id', order: 'ASCENDING' },
        { fieldPath: 'axis', order: 'ASCENDING' }
      ]
    }
  },
  
  // events 컬렉션
  {
    collection: 'events',
    pattern: {
      where: ['entity_participants', 'start_date', 'start_date'],
      orderBy: 'start_date',
      usage: 'timeWindowRules.js getEventsForYear',
      priority: 'MEDIUM'
    },
    requiredIndex: {
      fields: [
        { fieldPath: 'entity_participants', arrayConfig: 'CONTAINS' },
        { fieldPath: 'start_date', order: 'ASCENDING' }
      ]
    }
  },
  
  // artist_summary 컬렉션
  {
    collection: 'artist_summary',
    pattern: {
      where: ['is_temporary'],
      usage: 'functions/src/utils/universalDataAdapter.js checkP2CollaborationStatus',
      priority: 'MEDIUM'
    },
    requiredIndex: {
      fields: [
        { fieldPath: 'is_temporary', order: 'ASCENDING' }
      ]
    }
  },
  
  // entities 컬렉션
  {
    collection: 'entities',
    pattern: {
      where: ['identity_type', 'career_status'],
      usage: 'P1_BATCH_IMPLEMENTATION_GUIDE.md fnBatchComparePairs',
      priority: 'MEDIUM'
    },
    requiredIndex: {
      fields: [
        { fieldPath: 'identity_type', order: 'ASCENDING' },
        { fieldPath: 'career_status', order: 'ASCENDING' }
      ]
    }
  }
];

// 문서 명세 인덱스 (문서에서 수집)
const docSpecIndexes = [
  // DATA_MODEL_SPECIFICATION.md
  {
    collection: 'measures',
    name: 'measures_entity_axis_metric',
    fields: [
      { fieldPath: 'entity_id', order: 'ASCENDING' },
      { fieldPath: 'axis', order: 'ASCENDING' },
      { fieldPath: 'metric_code', order: 'ASCENDING' }
    ],
    source: 'docs/data/DATA_MODEL_SPECIFICATION.md Section 4.1.1',
    priority: 'MEDIUM'
  },
  {
    collection: 'measures',
    name: 'measures_entity_axis_time',
    fields: [
      { fieldPath: 'entity_id', order: 'ASCENDING' },
      { fieldPath: 'axis', order: 'ASCENDING' },
      { fieldPath: 'time_window', order: 'ASCENDING' }
    ],
    source: 'docs/data/DATA_MODEL_SPECIFICATION.md Section 4.1.1',
    priority: 'HIGH'
  },
  
  // SCHEMA_DESIGN_GUIDE.js
  {
    collection: 'measures',
    name: 'measures_entity_axis',
    fields: [
      { fieldPath: 'entity_id', order: 'ASCENDING' },
      { fieldPath: 'axis', order: 'ASCENDING' }
    ],
    source: 'scripts/firestore/SCHEMA_DESIGN_GUIDE.js line 274',
    priority: 'HIGH'
  },
  {
    collection: 'measures',
    name: 'measures_source_priority',
    fields: [
      { fieldPath: 'source_id', order: 'ASCENDING' },
      { fieldPath: 'priority', order: 'ASCENDING' }
    ],
    source: 'scripts/firestore/SCHEMA_DESIGN_GUIDE.js line 277',
    priority: 'LOW'
  },
  {
    collection: 'measures',
    name: 'measures_value_normalized',
    fields: [
      { fieldPath: 'value_normalized', order: 'ASCENDING' }
    ],
    source: 'scripts/firestore/SCHEMA_DESIGN_GUIDE.js line 278',
    priority: 'MEDIUM'
  },
  
  // SRD.md Section 13.2
  {
    collection: 'timeseries',
    name: 'timeseries_artist_axis_version',
    fields: [
      { fieldPath: 'artist_id', order: 'ASCENDING' },
      { fieldPath: 'axis', order: 'ASCENDING' },
      { fieldPath: 'version', order: 'DESCENDING' }
    ],
    source: 'docs/requirements/SRD.md Section 13.2',
    priority: 'HIGH'
  },
  
  // IA.md Section 4.2
  {
    collection: 'timeseries',
    name: 'timeseries_artist_axis_version_desc',
    fields: [
      { fieldPath: 'artist_id', order: 'ASCENDING' },
      { fieldPath: 'axis', order: 'ASCENDING' },
      { fieldPath: 'version', order: 'DESCENDING' }
    ],
    source: 'docs/architecture/IA.md Section 4.2',
    priority: 'HIGH'
  },
  {
    collection: 'artist_summary',
    name: 'artist_summary_artist_updated',
    fields: [
      { fieldPath: 'artist_id', order: 'ASCENDING' },
      { fieldPath: 'updated_at', order: 'DESCENDING' }
    ],
    source: 'docs/architecture/IA.md Section 4.2',
    priority: 'MEDIUM'
  },
  {
    collection: 'compare_pairs',
    name: 'compare_pairs_artists_axis',
    fields: [
      { fieldPath: 'artistA_id', order: 'ASCENDING' },
      { fieldPath: 'artistB_id', order: 'ASCENDING' },
      { fieldPath: 'axis', order: 'ASCENDING' }
    ],
    source: 'docs/architecture/IA.md Section 4.2',
    priority: 'MEDIUM'
  }
];

// 인덱스 비교 함수
function compareIndexes(index1, index2) {
  if (index1.collectionGroup !== index2.collectionGroup) return false;
  if (index1.fields.length !== index2.fields.length) return false;
  
  for (let i = 0; i < index1.fields.length; i++) {
    const f1 = index1.fields[i];
    const f2 = index2.fields[i];
    
    if (f1.fieldPath !== f2.fieldPath) return false;
    if (f1.order !== f2.order) return false;
    if (f1.arrayConfig !== f2.arrayConfig) return false;
  }
  
  return true;
}

// 단일 필드 인덱스 감지 함수
function isSingleFieldIndex(index) {
  return index.fields.length === 1 && 
         !index.fields[0].arrayConfig;
}

// 단일 필드 인덱스 검증 함수
function validateSingleFieldIndexes(currentIndexes) {
  const singleFieldIndexes = currentIndexes.indexes.filter(isSingleFieldIndex);
  if (singleFieldIndexes.length > 0) {
    console.warn('⚠️  단일 필드 인덱스 발견 (Firestore 자동 생성됨, 제거 권장):');
    singleFieldIndexes.forEach(idx => {
      console.warn(`   - ${idx.collectionGroup}: ${idx.fields[0].fieldPath}`);
    });
  }
  return singleFieldIndexes;
}

// 인덱스를 문자열로 변환
function indexToString(index) {
  const fields = index.fields.map(f => {
    if (f.arrayConfig) return `${f.fieldPath}[${f.arrayConfig}]`;
    return `${f.fieldPath}(${f.order || 'ASC'})`;
  });
  return `${index.collectionGroup}: [${fields.join(', ')}]`;
}

// 현재 인덱스 확인
function indexExists(index, currentIndexes) {
  return currentIndexes.indexes.some(idx => compareIndexes(idx, index));
}

// 분석 실행
function analyzeIndexes() {
  const missingIndexes = [];
  const codeIndexes = [];
  const docIndexes = [];
  
  // 단일 필드 인덱스 검증
  const singleFieldIndexes = validateSingleFieldIndexes(currentIndexes);
  
  // 코드 쿼리 패턴 기반 인덱스
  codeQueryPatterns.forEach(pattern => {
    const index = {
      collectionGroup: pattern.collection,
      queryScope: 'COLLECTION',
      fields: pattern.requiredIndex.fields
    };
    
    // 단일 필드 인덱스는 제외 (자동 생성됨)
    if (isSingleFieldIndex(index)) {
      return;
    }
    
    codeIndexes.push({
      index,
      pattern: pattern.pattern,
      priority: pattern.priority
    });
    
    if (!indexExists(index, currentIndexes)) {
      missingIndexes.push({
        index,
        source: 'CODE',
        pattern: pattern.pattern,
        priority: pattern.priority,
        usage: pattern.pattern.usage
      });
    }
  });
  
  // 문서 명세 인덱스
  docSpecIndexes.forEach(spec => {
    const index = {
      collectionGroup: spec.collection,
      queryScope: 'COLLECTION',
      fields: spec.fields
    };
    
    // 단일 필드 인덱스는 제외 (자동 생성됨)
    if (isSingleFieldIndex(index)) {
      return;
    }
    
    docIndexes.push({
      index,
      name: spec.name,
      source: spec.source,
      priority: spec.priority
    });
    
    if (!indexExists(index, currentIndexes)) {
      missingIndexes.push({
        index,
        source: 'DOCUMENTATION',
        name: spec.name,
        priority: spec.priority,
        docSource: spec.source
      });
    }
  });
  
  return {
    missingIndexes,
    codeIndexes,
    docIndexes,
    currentIndexes: currentIndexes.indexes,
    singleFieldIndexes
  };
}

// 리포트 생성
function generateReport(analysis) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalCurrentIndexes: analysis.currentIndexes.length,
      totalCodePatterns: analysis.codeIndexes.length,
      totalDocSpecs: analysis.docIndexes.length,
      missingIndexes: analysis.missingIndexes.length,
      singleFieldIndexes: analysis.singleFieldIndexes.length,
      missingByPriority: {
        HIGH: analysis.missingIndexes.filter(i => i.priority === 'HIGH').length,
        MEDIUM: analysis.missingIndexes.filter(i => i.priority === 'MEDIUM').length,
        LOW: analysis.missingIndexes.filter(i => i.priority === 'LOW').length
      }
    },
    singleFieldIndexes: analysis.singleFieldIndexes.map(item => ({
      collection: item.collectionGroup,
      field: item.fields[0].fieldPath,
      indexString: `${item.collectionGroup}: [${item.fields[0].fieldPath}]`,
      note: 'Firestore 자동 생성됨 - firestore.indexes.json에서 제거 필요'
    })),
    missingIndexes: analysis.missingIndexes.map(item => ({
      collection: item.index.collectionGroup,
      fields: item.index.fields.map(f => ({
        fieldPath: f.fieldPath,
        order: f.order,
        arrayConfig: f.arrayConfig
      })),
      source: item.source,
      priority: item.priority,
      usage: item.usage || item.docSource || item.name || 'Unknown',
      indexString: indexToString(item.index)
    })),
    recommendations: {
      highPriority: analysis.missingIndexes
        .filter(i => i.priority === 'HIGH')
        .map(i => ({
          collection: i.index.collectionGroup,
          indexString: indexToString(i.index),
          reason: i.usage || i.docSource || 'Required by code/documentation'
        })),
      mediumPriority: analysis.missingIndexes
        .filter(i => i.priority === 'MEDIUM')
        .map(i => ({
          collection: i.index.collectionGroup,
          indexString: indexToString(i.index),
          reason: i.usage || i.docSource || 'Recommended by documentation'
        })),
      removeSingleFieldIndexes: analysis.singleFieldIndexes.length > 0 ? {
        message: '다음 단일 필드 인덱스는 firestore.indexes.json에서 제거해야 합니다 (Firestore 자동 생성)',
        indexes: analysis.singleFieldIndexes.map(idx => ({
          collection: idx.collectionGroup,
          field: idx.fields[0].fieldPath
        }))
      } : null
    }
  };
  
  return report;
}

// 메인 실행
if (require.main === module) {
  const analysis = analyzeIndexes();
  const report = generateReport(analysis);
  
  console.log(JSON.stringify(report, null, 2));
  
  // 리포트 파일 저장
  const reportPath = path.join(__dirname, '../../firestore-index-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.error(`\n✅ 리포트 저장됨: ${reportPath}`);
}

module.exports = { analyzeIndexes, generateReport };

