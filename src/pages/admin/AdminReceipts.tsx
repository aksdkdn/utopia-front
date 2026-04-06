import { useMemo, useState } from 'react';
import AdminHeader from './components/AdminHeader';
import FilterTabs from './components/FilterTabs';
import { receiptsData } from './data/mockData';

const STATUS_STYLE: Record<string, string> = {
  대기: 'text-amber-500 bg-amber-50',
  승인: 'text-emerald-500 bg-emerald-50',
  거절: 'text-red-500 bg-red-50',
};

const FILTER_TABS = ['전체', '대기', '승인', '거절'];

const formatWon = (amount: number) => `₩ ${amount.toLocaleString()}`;

export default function AdminReceipts() {
  const [activeTab, setActiveTab] = useState('전체');
  const [search, setSearch] = useState('');
  const [receipts, setReceipts] = useState(receiptsData);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(
    null,
  );
  const [manualAmount, setManualAmount] = useState('');
  const [decisionReason, setDecisionReason] = useState('');

  const filtered = useMemo(() => {
    let data = receipts;

    if (activeTab !== '전체') {
      data = data.filter((receipt) => receipt.status === activeTab);
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (receipt) =>
          receipt.id.toLowerCase().includes(q) ||
          receipt.userId.toLowerCase().includes(q) ||
          receipt.partyId.toLowerCase().includes(q) ||
          receipt.status.toLowerCase().includes(q),
      );
    }

    return data;
  }, [activeTab, receipts, search]);

  const selectedReceipt = useMemo(
    () => receipts.find((receipt) => receipt.id === selectedReceiptId) ?? null,
    [receipts, selectedReceiptId],
  );

  const reviewReceipt = (nextStatus: '승인' | '거절') => {
    if (!selectedReceipt) return;

    setReceipts((prev) =>
      prev.map((receipt) =>
        receipt.id === selectedReceipt.id
          ? { ...receipt, status: nextStatus }
          : receipt,
      ),
    );
  };

  return (
    <>
      <AdminHeader
        placeholder="영수증 검색 (user/party/status)..."
        onSearch={setSearch}
      />
      <div className="p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section>
            <h1 className="mb-1 text-2xl font-bold">영수증 승인 관리</h1>
            <p className="text-sm text-gray-500">
              OCR 결과와 관리자 수정값을 비교하면서, 승인/거절 사유를 함께 남길
              수 있도록 구성했습니다.
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
                    Receipt ID
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    사용자
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    파티
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    OCR 금액
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
                {filtered.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-3.5 text-sm">{receipt.id}</td>
                    <td className="px-4 py-3.5 text-sm">{receipt.userId}</td>
                    <td className="px-4 py-3.5 text-sm">{receipt.partyId}</td>
                    <td className="px-4 py-3.5 text-sm">
                      {formatWon(receipt.ocrAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[receipt.status] ?? ''}`}
                      >
                        {receipt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <button
                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        onClick={() => {
                          setSelectedReceiptId(receipt.id);
                          setManualAmount(`${receipt.ocrAmount}`);
                          setDecisionReason('');
                        }}
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
              테이블보다 선택 후 우측 프리뷰에서 OCR 값과 수동 수정값을 비교하는
              흐름으로 바꿨습니다.
            </div>
          </div>
        </div>
      </div>

      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="flex h-full w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold text-gray-400">
                  영수증 상세 패널
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedReceipt.id}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedReceipt.userId} · {selectedReceipt.partyId}
                </p>
              </div>
              <button
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-50"
                onClick={() => setSelectedReceiptId(null)}
              >
                닫기
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      영수증 미리보기
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      실제 운영에서는 원본 이미지를 연결하는 영역입니다.
                    </p>
                  </div>
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500">
                    {selectedReceipt.createdAt}
                  </span>
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center text-sm text-gray-400">
                  영수증 이미지 프리뷰
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  OCR 추출값 vs 관리자 수정값
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs text-gray-400">OCR 추출 금액</p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {formatWon(selectedReceipt.ocrAmount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400">
                      관리자 확인 금액
                    </label>
                    <input
                      type="number"
                      value={manualAmount}
                      onChange={(event) => setManualAmount(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  승인/거절 사유
                </h3>
                <textarea
                  value={decisionReason}
                  onChange={(event) => setDecisionReason(event.target.value)}
                  rows={5}
                  placeholder="OCR 오인식, 금액 차이, 이미지 불량 등 판단 사유를 남겨주세요."
                  className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none"
                />
              </section>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
              <p className="text-xs text-gray-400">
                승인 시 결제/정산 상태를 업데이트하고, 거절 시 사유를 사용자에게
                안내하는 흐름을 상정했습니다.
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-blue-300 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                  onClick={() => reviewReceipt('승인')}
                >
                  승인
                </button>
                <button
                  className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                  onClick={() => reviewReceipt('거절')}
                >
                  거절
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
