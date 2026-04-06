import { useEffect, useMemo, useState } from 'react';
import AdminHeader from './components/AdminHeader';
import FilterTabs from './components/FilterTabs';
import { settlementsData } from './data/mockData';

const STATUS_STYLE: Record<string, string> = {
  대기: 'text-amber-500 bg-amber-50',
  승인: 'text-emerald-500 bg-emerald-50',
  거절: 'text-red-500 bg-red-50',
};

const FILTER_TABS = ['전체', '대기', '승인', '거절'];

const REVIEW_CHECKLIST = [
  '영수증 연결 여부 확인',
  '총 청구 금액 확인',
  '멤버별 분담금 계산 확인',
];

const formatWon = (amount: number) => `₩ ${amount.toLocaleString()}`;

function buildMemberBreakdown(totalAmount: number, memberCount: number) {
  const eachAmount = Math.floor(totalAmount / memberCount);

  return Array.from({ length: memberCount }, (_, index) => ({
    id: `member_${index + 1}`,
    amount: eachAmount,
  }));
}

function buildHistory(id: string, status: string) {
  return [`${id} 정산 요청 생성`, `영수증 연결 확인`, `현재 상태: ${status}`];
}

export default function AdminSettlements() {
  const [activeTab, setActiveTab] = useState('전체');
  const [search, setSearch] = useState('');
  const [settlements, setSettlements] = useState(settlementsData);
  const [selectedSettlementId, setSelectedSettlementId] = useState<
    string | null
  >(null);
  const [reviewChecklist, setReviewChecklist] = useState<boolean[]>(
    REVIEW_CHECKLIST.map(() => false),
  );
  const [reviewMemo, setReviewMemo] = useState('');

  const filtered = useMemo(() => {
    let data = settlements;

    if (activeTab !== '전체') {
      data = data.filter((settlement) => settlement.status === activeTab);
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (settlement) =>
          settlement.id.toLowerCase().includes(q) ||
          settlement.partyId.toLowerCase().includes(q) ||
          settlement.leaderId.toLowerCase().includes(q) ||
          settlement.status.toLowerCase().includes(q),
      );
    }

    return data;
  }, [activeTab, search, settlements]);

  const selectedSettlement = useMemo(
    () =>
      settlements.find(
        (settlement) => settlement.id === selectedSettlementId,
      ) ?? null,
    [selectedSettlementId, settlements],
  );

  useEffect(() => {
    setReviewChecklist(REVIEW_CHECKLIST.map(() => false));
    setReviewMemo('');
  }, [selectedSettlementId]);

  const allChecked = reviewChecklist.every(Boolean);

  const reviewSettlement = (nextStatus: '승인' | '거절') => {
    if (!selectedSettlement) return;

    setSettlements((prev) =>
      prev.map((settlement) =>
        settlement.id === selectedSettlement.id
          ? { ...settlement, status: nextStatus }
          : settlement,
      ),
    );
  };

  return (
    <>
      <AdminHeader
        placeholder="정산 검색 (party/leader/status)..."
        onSearch={setSearch}
      />
      <div className="p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section>
            <h1 className="mb-1 text-2xl font-bold">정산 승인 관리</h1>
            <p className="text-sm text-gray-500">
              상세 패널에서 멤버별 부담액과 영수증 연결 여부를 확인하고,
              체크리스트를 모두 완료한 뒤 승인하도록 구성했습니다.
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
                    정산 ID
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    파티
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    파티장
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    총액
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    멤버 수
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    청구월
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    상태
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((settlement) => (
                  <tr
                    key={settlement.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-3.5 text-sm">{settlement.id}</td>
                    <td className="px-4 py-3.5 text-sm">
                      {settlement.partyId}
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      {settlement.leaderId}
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      {formatWon(settlement.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      {settlement.memberCount}명
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      {settlement.billingMonth}
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[settlement.status] ?? ''}`}
                      >
                        {settlement.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <button
                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        onClick={() => setSelectedSettlementId(settlement.id)}
                      >
                        상세 열기
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
              승인 전 체크리스트를 두어 검토 근거가 부족한 상태에서는 바로
              승인하지 않도록 구성했습니다.
            </div>
          </div>
        </div>
      </div>

      {selectedSettlement && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="flex h-full w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold text-gray-400">
                  정산 상세 패널
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedSettlement.id}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedSettlement.partyId} ·{' '}
                  {selectedSettlement.billingMonth}
                </p>
              </div>
              <button
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-50"
                onClick={() => setSelectedSettlementId(null)}
              >
                닫기
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <section className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">참여 인원</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {selectedSettlement.memberCount}명
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">월 청구 금액</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {formatWon(selectedSettlement.totalAmount)}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">영수증 연결 여부</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    연결 확인 필요
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">이전 승인 이력</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {
                      buildHistory(
                        selectedSettlement.id,
                        selectedSettlement.status,
                      ).length
                    }
                    건
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  멤버별 부담액
                </h3>
                <div className="mt-4 space-y-3">
                  {buildMemberBreakdown(
                    selectedSettlement.totalAmount,
                    selectedSettlement.memberCount,
                  ).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600"
                    >
                      <span>{member.id}</span>
                      <span className="font-semibold text-gray-900">
                        {formatWon(member.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  이전 승인 이력
                </h3>
                <div className="mt-4 space-y-3">
                  {buildHistory(
                    selectedSettlement.id,
                    selectedSettlement.status,
                  ).map((item) => (
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
                  검토 체크리스트
                </h3>
                <div className="mt-4 space-y-3">
                  {REVIEW_CHECKLIST.map((item, index) => (
                    <label
                      key={item}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600"
                    >
                      <input
                        type="checkbox"
                        checked={reviewChecklist[index]}
                        onChange={(event) =>
                          setReviewChecklist((prev) =>
                            prev.map((checked, itemIndex) =>
                              itemIndex === index
                                ? event.target.checked
                                : checked,
                            ),
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  검토 메모
                </h3>
                <textarea
                  value={reviewMemo}
                  onChange={(event) => setReviewMemo(event.target.value)}
                  rows={5}
                  placeholder="승인/거절 판단 근거를 기록하세요."
                  className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none"
                />
              </section>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
              <p className="text-xs text-gray-400">
                승인 버튼은 검토 체크리스트를 모두 확인한 뒤에만 활성화됩니다.
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                  onClick={() => reviewSettlement('거절')}
                >
                  거절
                </button>
                <button
                  className="rounded-md border border-blue-300 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
                  onClick={() => reviewSettlement('승인')}
                  disabled={!allChecked}
                >
                  승인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
