import { useMemo, useState } from 'react';
import AdminHeader from './components/AdminHeader';
import FilterTabs from './components/FilterTabs';
import { reportsData } from './data/mockData';

const STATUS_STYLE: Record<string, string> = {
  접수: 'text-amber-500 bg-amber-50',
  처리: 'text-blue-500 bg-blue-50',
  기각: 'text-red-500 bg-red-50',
  이의제기: 'text-violet-500 bg-violet-50',
  AI처리: 'text-blue-500 bg-blue-50',
};

const FILTER_TABS = ['전체', '접수', '처리', '기각', '이의제기', 'AI처리'];

function buildReportDetails(report: (typeof reportsData)[number]) {
  const sameTargetCount = reportsData.filter(
    (item) => item.target === report.target,
  ).length;

  return {
    reporterId: `reporter_${report.id.split('-')[1]}`,
    relatedCount: sameTargetCount,
    originalText:
      report.content ||
      `${report.target} 관련 ${report.reason} 신고 원문을 검토해야 합니다.`,
    aiVerdict: report.content.includes('AI처리')
      ? 'AI 자동 분류됨'
      : '관리자 직접 판정 필요',
    history: [
      `${report.createdAt} 신고 접수`,
      report.content.includes('AI처리')
        ? `${report.createdAt} AI 사전 분류 완료`
        : `${report.createdAt} 수동 검토 대기`,
    ],
  };
}

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('전체');
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState(reportsData);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('처리');
  const [reviewMemo, setReviewMemo] = useState('');

  const filtered = useMemo(() => {
    let data = reports;

    if (activeTab !== '전체') {
      data = data.filter((report) => report.status === activeTab);
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (report) =>
          report.target.toLowerCase().includes(q) ||
          report.reason.toLowerCase().includes(q) ||
          report.status.toLowerCase().includes(q),
      );
    }

    return data;
  }, [activeTab, reports, search]);

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? null,
    [reports, selectedReportId],
  );

  const applyResolution = (nextStatus: '처리' | '기각') => {
    if (!selectedReport) return;

    setReports((prev) =>
      prev.map((report) =>
        report.id === selectedReport.id
          ? { ...report, status: nextStatus }
          : report,
      ),
    );
  };

  return (
    <>
      <AdminHeader
        placeholder="신고 검색 (대상/사유/상태)..."
        onSearch={setSearch}
      />
      <div className="p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section>
            <h1 className="mb-1 text-2xl font-bold">신고 관리</h1>
            <p className="text-sm text-gray-500">
              신고 상세 패널에서 누적 신고 수, 관련 원문, AI 판정 여부를 함께
              보고 처리/기각을 결정합니다.
            </p>
          </section>

          <FilterTabs
            tabs={FILTER_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    유형
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    대상
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    사유
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    상태
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    접수일
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-3.5 text-sm">{report.type}</td>
                    <td className="px-4 py-3.5 text-sm">{report.target}</td>
                    <td className="px-4 py-3.5 text-sm">{report.reason}</td>
                    <td className="px-4 py-3.5 text-sm">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[report.status] ?? ''}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {report.createdAt}
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <button
                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        onClick={() => setSelectedReportId(report.id)}
                      >
                        상세 열기
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
              처리/기각은 바로 끝내지 않고, 우측 패널에서 관련 근거와 메모를
              남긴 뒤 저장하는 흐름으로 바꿨습니다.
            </div>
          </div>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="flex h-full w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold text-gray-400">
                  신고 상세 패널
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedReport.reason}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedReport.type} · {selectedReport.target}
                </p>
              </div>
              <button
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-50"
                onClick={() => setSelectedReportId(null)}
              >
                닫기
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <section className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">신고자</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {buildReportDetails(selectedReport).reporterId}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">누적 신고 수</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {buildReportDetails(selectedReport).relatedCount}건
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">AI 판정 여부</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {buildReportDetails(selectedReport).aiVerdict}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">현재 상태</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {selectedReport.status}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  관련 원문
                </h3>
                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-600">
                  {buildReportDetails(selectedReport).originalText}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  처리 이력
                </h3>
                <div className="mt-4 space-y-3">
                  {buildReportDetails(selectedReport).history.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  검토 입력
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400">
                      처리 유형
                    </label>
                    <select
                      value={resolution}
                      onChange={(event) => setResolution(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none"
                    >
                      <option value="처리">처리</option>
                      <option value="기각">기각</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400">
                      관리자 메모
                    </label>
                    <textarea
                      value={reviewMemo}
                      onChange={(event) => setReviewMemo(event.target.value)}
                      rows={5}
                      placeholder="판단 근거, 패널티, 사용자 안내 문구 등을 기록합니다."
                      className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
              <p className="text-xs text-gray-400">
                신고 대상과 처리 이력을 한 패널에서 보고, 결정 후 상태를
                저장합니다.
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-blue-300 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                  onClick={() => applyResolution('처리')}
                >
                  처리 저장
                </button>
                <button
                  className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                  onClick={() => applyResolution('기각')}
                >
                  기각 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
