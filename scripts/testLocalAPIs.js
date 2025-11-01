// CuratorOdyssey 로컬 API 테스트 스크립트
// 실제 배포 전 로컬 에뮬레이터에서 검증

const axios = require('axios');

class LocalAPITester {
  constructor() {
    this.baseUrl = 'http://127.0.0.1:5001/co-1016/asia-northeast3';
    this.testResults = {
      start_time: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
  }

  async runAllTests() {
    console.log('🧪 CuratorOdyssey 로컬 API 테스트 시작...');
    console.log(`📡 Base URL: ${this.baseUrl}`);

    const tests = [
      () => this.testArtistSummary('ARTIST_0005'), // 양혜규 (기본)
      () => this.testArtistSummary('ARTIST_0003'), // 이우환 (변형)
      () => this.testArtistSummary('INVALID'),     // 404 테스트
      () => this.testArtistSunburst('ARTIST_0005'),
      () => this.testArtistTimeseries('ARTIST_0005', '제도'),
      () => this.testCompareArtists('ARTIST_0005', 'ARTIST_0003', '담론'),
      () => this.testAIReport(),
      () => this.testVertexHealth()
    ];

    for (const test of tests) {
      try {
        await test();
        await this.delay(500); // API 과부하 방지
      } catch (error) {
        console.error('테스트 실행 오류:', error.message);
        this.addTestResult('테스트 실행', false, error.message);
      }
    }

    this.printSummary();
    await this.saveResults();
  }

  async testArtistSummary(artistId) {
    const testName = `GET /artist/${artistId}/summary`;
    try {
      const response = await axios.get(`${this.baseUrl}/getArtistSummary`, {
        params: { id: artistId },
        timeout: 10000
      });

      const isValid = response.data && 
                      response.data.name && 
                      response.data.radar5 && 
                      response.data.sunburst_l1;

      this.addTestResult(testName, response.status === 200 && isValid, 
        `Status: ${response.status}, Name: ${response.data?.name}, Source: ${response.data?.data_source}`);

    } catch (error) {
      this.addTestResult(testName, false, 
        `${error.response?.status || 'Network Error'}: ${error.message}`);
    }
  }

  async testArtistSunburst(artistId) {
    const testName = `GET /artist/${artistId}/sunburst`;
    try {
      const response = await axios.get(`${this.baseUrl}/getArtistSunburst`, {
        params: { id: artistId },
        timeout: 10000
      });

      const isValid = response.data && response.data.name;
      this.addTestResult(testName, response.status === 200 && isValid, 
        `Status: ${response.status}`);

    } catch (error) {
      this.addTestResult(testName, false, 
        `${error.response?.status || 'Network Error'}: ${error.message}`);
    }
  }

  async testArtistTimeseries(artistId, axis) {
    const testName = `GET /artist/${artistId}/timeseries/${axis}`;
    try {
      const response = await axios.get(`${this.baseUrl}/getArtistTimeseries`, {
        params: { id: artistId, axis: axis },
        timeout: 10000
      });

      const isValid = response.data && response.data.bins;
      this.addTestResult(testName, response.status === 200 && isValid, 
        `Status: ${response.status}, Bins: ${response.data?.bins?.length || 0}`);

    } catch (error) {
      this.addTestResult(testName, false, 
        `${error.response?.status || 'Network Error'}: ${error.message}`);
    }
  }

  async testCompareArtists(artistA, artistB, axis) {
    const testName = `GET /compare/${artistA}/${artistB}/${axis}`;
    try {
      const response = await axios.get(`${this.baseUrl}/getCompareArtists`, {
        params: { A: artistA, B: artistB, axis: axis },
        timeout: 10000
      });

      const isValid = response.data && response.data.series;
      this.addTestResult(testName, response.status === 200 && isValid, 
        `Status: ${response.status}, Series: ${response.data?.series?.length || 0}`);

    } catch (error) {
      this.addTestResult(testName, false, 
        `${error.response?.status || 'Network Error'}: ${error.message}`);
    }
  }

  async testAIReport() {
    const testName = 'POST /report/generate';
    try {
      const testData = {
        artistA_data: {
          name: "테스트 작가",
          radar5: { I: 80, F: 70, A: 60, M: 50, Sedu: 40 },
          sunburst_l1: { 제도: 75, 학술: 65, 담론: 55, 네트워크: 70 }
        }
      };

      const response = await axios.post(`${this.baseUrl}/generateAiReport`, testData, {
        timeout: 30000 // AI 생성은 시간이 오래 걸림
      });

      const isValid = response.data && (response.data.success || response.data.report);
      this.addTestResult(testName, response.status === 200 && isValid, 
        `Status: ${response.status}, Success: ${response.data?.success}, Model: ${response.data?.model}`);

    } catch (error) {
      this.addTestResult(testName, false, 
        `${error.response?.status || 'Network Error'}: ${error.message}`);
    }
  }

  async testVertexHealth() {
    const testName = 'GET /ai/vertex-health';
    try {
      const response = await axios.get(`${this.baseUrl}/checkVertexHealth`, {
        timeout: 15000
      });

      const isValid = response.data && response.data.status;
      this.addTestResult(testName, response.status === 200 && isValid, 
        `Status: ${response.status}, Vertex Status: ${response.data?.status}`);

    } catch (error) {
      this.addTestResult(testName, false, 
        `${error.response?.status || 'Network Error'}: ${error.message}`);
    }
  }

  addTestResult(testName, success, details) {
    const result = {
      test: testName,
      success: success,
      details: details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.tests.push(result);
    this.testResults.summary.total++;
    
    if (success) {
      this.testResults.summary.passed++;
      console.log(`✅ ${testName}: ${details}`);
    } else {
      this.testResults.summary.failed++;
      console.log(`❌ ${testName}: ${details}`);
    }
  }

  printSummary() {
    const { total, passed, failed } = this.testResults.summary;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    console.log('\n📊 로컬 API 테스트 결과:');
    console.log(`✅ 성공: ${passed}개`);
    console.log(`❌ 실패: ${failed}개`);
    console.log(`📈 성공률: ${successRate}%`);
    
    if (failed > 0) {
      console.log('\n❌ 실패한 테스트들:');
      this.testResults.tests
        .filter(t => !t.success)
        .forEach(t => console.log(`  - ${t.test}: ${t.details}`));
    }
  }

  async saveResults() {
    const fs = require('fs').promises;
    
    try {
      await fs.writeFile(
        'LOCAL-API-TEST-RESULTS.json', 
        JSON.stringify(this.testResults, null, 2),
        'utf8'
      );
      console.log('💾 테스트 결과 저장: LOCAL-API-TEST-RESULTS.json');
    } catch (error) {
      console.error('결과 저장 실패:', error);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 스크립트 실행
if (require.main === module) {
  const tester = new LocalAPITester();
  tester.runAllTests()
    .then(() => {
      console.log('🎉 모든 로컬 API 테스트 완료!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 테스트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = LocalAPITester;

