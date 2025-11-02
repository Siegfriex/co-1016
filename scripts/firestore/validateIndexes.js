#!/usr/bin/env node
/**
 * Firestore 인덱스 검증 스크립트
 * 
 * 코드베이스의 쿼리 패턴과 문서 명세를 분석하여 누락된 인덱스를 검증하고 리포트를 생성합니다.
 * 
 * 사용법:
 *   node scripts/firestore/validateIndexes.js
 *   node scripts/firestore/validateIndexes.js --json > report.json
 *   node scripts/firestore/validateIndexes.js --check-only (CI/CD용)
 */

const fs = require('fs');
const path = require('path');
const { analyzeIndexes, generateReport } = require('./analyzeIndexRequirements');

// 명령줄 인자 파싱
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const checkOnly = args.includes('--check-only');
const verbose = args.includes('--verbose');

// 검증 실행
function validateIndexes() {
  console.error('🔍 Firestore 인덱스 검증 시작...\n');
  
  try {
    // 인덱스 분석
    const analysis = analyzeIndexes();
    const report = generateReport(analysis);
    
    // 결과 출력
    if (jsonOutput) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printHumanReadableReport(report, verbose);
    }
    
    // CI/CD 모드: 누락 인덱스가 있으면 종료 코드 1 반환
    if (checkOnly) {
      if (report.summary.missingIndexes > 0) {
        console.error(`\n❌ 누락된 인덱스 발견: ${report.summary.missingIndexes}개`);
        process.exit(1);
      }
      if (report.summary.singleFieldIndexes > 0) {
        console.error(`\n❌ 단일 필드 인덱스 발견: ${report.summary.singleFieldIndexes}개 (제거 필요)`);
        process.exit(1);
      }
      console.error('\n✅ 모든 인덱스가 정상적으로 배포되었습니다.');
      process.exit(0);
    }
    
    // 리포트 파일 저장
    const reportPath = path.join(__dirname, '../../firestore-index-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    if (!jsonOutput) {
      console.error(`\n✅ 리포트 저장됨: ${reportPath}`);
    }
    
    return report;
    
  } catch (error) {
    console.error('❌ 검증 중 오류 발생:', error.message);
    if (verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// 사람이 읽기 쉬운 리포트 출력
function printHumanReadableReport(report, verbose) {
  console.log('='.repeat(80));
  console.log('Firestore 인덱스 검증 리포트');
  console.log('='.repeat(80));
  console.log(`\n📊 요약:`);
  console.log(`   - 현재 배포된 인덱스: ${report.summary.totalCurrentIndexes}개`);
  console.log(`   - 코드에서 발견된 쿼리 패턴: ${report.summary.totalCodePatterns}개`);
  console.log(`   - 문서에 명시된 인덱스: ${report.summary.totalDocSpecs}개`);
  console.log(`   - 누락된 인덱스: ${report.summary.missingIndexes}개`);
  console.log(`     • HIGH 우선순위: ${report.summary.missingByPriority.HIGH}개`);
  console.log(`     • MEDIUM 우선순위: ${report.summary.missingByPriority.MEDIUM}개`);
  console.log(`     • LOW 우선순위: ${report.summary.missingByPriority.LOW}개`);
  
  if (report.summary.singleFieldIndexes > 0) {
    console.log(`   - 단일 필드 인덱스 발견: ${report.summary.singleFieldIndexes}개 (제거 필요)`);
  }
  
  // 단일 필드 인덱스 경고 출력
  if (report.singleFieldIndexes && report.singleFieldIndexes.length > 0) {
    console.log(`\n⚠️  단일 필드 인덱스 경고:\n`);
    console.log('   Firestore는 단일 필드 인덱스를 자동으로 생성하므로 firestore.indexes.json에서 제거해야 합니다.\n');
    report.singleFieldIndexes.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.collection}: ${item.indexString}`);
      console.log(`      참고: ${item.note}`);
    });
    console.log('');
  }
  
  if (report.missingIndexes.length > 0) {
    console.log(`\n⚠️  누락된 인덱스 목록:\n`);
    
    // 우선순위별로 그룹화
    const highPriority = report.missingIndexes.filter(i => i.priority === 'HIGH');
    const mediumPriority = report.missingIndexes.filter(i => i.priority === 'MEDIUM');
    const lowPriority = report.missingIndexes.filter(i => i.priority === 'LOW');
    
    if (highPriority.length > 0) {
      console.log('🔴 HIGH 우선순위 (즉시 추가 필요):');
      highPriority.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.collection}: ${item.indexString}`);
        console.log(`      출처: ${item.usage}`);
        if (verbose) {
          console.log(`      필드: ${JSON.stringify(item.fields, null, 8)}`);
        }
      });
      console.log('');
    }
    
    if (mediumPriority.length > 0) {
      console.log('🟡 MEDIUM 우선순위 (추가 권장):');
      mediumPriority.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.collection}: ${item.indexString}`);
        console.log(`      출처: ${item.usage}`);
      });
      console.log('');
    }
    
    if (lowPriority.length > 0) {
      console.log('🟢 LOW 우선순위 (선택적):');
      lowPriority.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.collection}: ${item.indexString}`);
        console.log(`      출처: ${item.usage}`);
      });
      console.log('');
    }
  } else {
    console.log('\n✅ 모든 인덱스가 정상적으로 배포되었습니다!');
  }
  
  // 권장사항 출력
  if (report.recommendations.highPriority.length > 0 || report.recommendations.mediumPriority.length > 0) {
    console.log('\n📋 권장사항:');
    
    if (report.recommendations.highPriority.length > 0) {
      console.log('\n   즉시 추가 권장:');
      report.recommendations.highPriority.forEach((rec, idx) => {
        console.log(`   ${idx + 1}. ${rec.collection}: ${rec.indexString}`);
        console.log(`      이유: ${rec.reason}`);
      });
    }
    
    if (report.recommendations.mediumPriority.length > 0) {
      console.log('\n   추가 검토 권장:');
      report.recommendations.mediumPriority.forEach((rec, idx) => {
        console.log(`   ${idx + 1}. ${rec.collection}: ${rec.indexString}`);
        console.log(`      이유: ${rec.reason}`);
      });
    }
    
    if (report.recommendations.removeSingleFieldIndexes) {
      console.log('\n   제거 권장 (단일 필드 인덱스):');
      console.log(`   ${report.recommendations.removeSingleFieldIndexes.message}`);
      report.recommendations.removeSingleFieldIndexes.indexes.forEach((idx, i) => {
        console.log(`   ${i + 1}. ${idx.collection}: ${idx.field}`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(80));
}

// 메인 실행
if (require.main === module) {
  validateIndexes();
}

module.exports = { validateIndexes };

