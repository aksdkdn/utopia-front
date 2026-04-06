import { useMemo, useState } from 'react';
import AdminHeader from './components/AdminHeader';
import FilterTabs from './components/FilterTabs';
import { adminPartiesData } from './data/mockData';

const STATUS_STYLE: Record<string, string> = {
  운영중: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  모집중: 'bg-blue-50 text-blue-600 border-blue-100',
  위험: 'bg-amber-50 text-amber-600 border-amber-100',
  '종료 예정': 'bg-red-50 text-red-600 border-red-100',
};

const FILTER_TABS = ['전체', '운영중', '모집중', '위험', '종료 예정'];

function buildPartyTitle(service: string, status: string) {
  if (status === '모집중') return `${service} 추가 멤버 모집`;
  if (status === '위험') return `${service} 운영 리스크 점검`;
  if (status === '종료 예정') return `${service} 종료 전 정산 확인`;
  return `${service} 운영 파티`;
}

function buildLeaderName(leaderId: string) {
  return `방장 ${leaderId}`;
}

const formatWon = (amount: number) => `₩ ${amount.toLocaleString()}`;

export default function AdminParties() {
  const [activeTab, setActiveTab] = useState('전체');
  const [search, setSearch] = useState('');
  const [parties, setParties] = useState(adminPartiesData);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [closeReason, setCloseReason] = useState('');
  const [confirmingClose, setConfirmingClose] = useState(false);

  const filtered = useMemo(() => {
    let data = parties;

    if (activeTab !== '전체') {
      data = data.filter((party) => party.status === activeTab);
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (party) =>
          party.id.toLowerCase().includes(q) ||
          party.service.toLowerCase().includes(q) ||
          party.leaderId.toLowerCase().includes(q) ||
          buildPartyTitle(party.service, party.status)
            .toLowerCase()
            .includes(q),
      );
    }

    return data;
  }, [activeTab, parties, search]);

  const selectedParty = useMemo(
    () => parties.find((party) => party.id === selectedPartyId) ?? null,
    [parties, selectedPartyId],
  );

  const summary = useMemo(
    () => [
      { label: '전체 파티', value: `${parties.length}` },
      {
        label: '운영중',
        value: `${parties.filter((party) => party.status === '운영중').length}`,
      },
      {
        label: '위험',
        value: `${parties.filter((party) => party.status === '위험').length}`,
      },
      {
        label: '종료 예정',
        value: `${parties.filter((party) => party.status === '종료 예정').length}`,
      },
    ],
    [parties],
  );

  const handleForceClose = () => {
    if (!selectedParty) return;

    setParties((prev) =>
      prev.map((party) =>
        party.id === selectedParty.id
          ? { ...party, status: '종료 예정' }
          : party,
      ),
    );
    setConfirmingClose(false);
  };

  return (
    <>
      <AdminHeader
        placeholder="파티 검색 (제목/서비스/방장)..."
        onSearch={setSearch}
        rightContent={
          <button className="rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
            정산 정책
          </button>
        }
      />
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section>
            <h1 className="text-2xl font-bold text-gray-900">파티관리</h1>
            <p className="mt-1 text-sm text-gray-500">
              파티 운영 상태, 신고 누적, 최근 결제 이슈를 한 화면에서 관리할 수
              있게 구성했습니다.
            </p>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <FilterTabs
            tabs={FILTER_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                      파티 제목
                    </th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                      서비스명
                    </th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                      방장
                    </th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                      인원
                    </th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                      신고수
                    </th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                      최근 결제일
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
                  {filtered.map((party) => {
                    const isRisk =
                      party.status === '위험' || party.status === '종료 예정';

                    return (
                      <tr
                        key={party.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="px-4 py-3.5">
                          <div
                            className={`border-l-4 pl-3 ${
                              isRisk ? 'border-amber-400' : 'border-transparent'
                            }`}
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {buildPartyTitle(party.service, party.status)}
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                              {party.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">
                          {party.service}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">
                          <div>{buildLeaderName(party.leaderId)}</div>
                          <div className="mt-1 text-xs text-gray-400">
                            {party.leaderId}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">
                          {party.memberCount}명
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">
                          {party.reportCount}건
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">
                          {party.lastPayment}
                        </td>
                        <td className="px-4 py-3.5 text-sm">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[party.status]}`}
                          >
                            {party.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm">
                          <button
                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                            onClick={() => setSelectedPartyId(party.id)}
                          >
                            상세 열기
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-sm text-gray-400"
                      >
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
              위험 상태 파티는 좌측 경고 표시로 눈에 띄게 구분하고, 강제 종료는
              상세 패널에서 사유 입력 후 진행하도록 바꿨습니다.
            </div>
          </section>
        </div>
      </div>

      {selectedParty && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="flex h-full w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold text-gray-400">
                  파티 상세 패널
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {buildPartyTitle(selectedParty.service, selectedParty.status)}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedParty.service} · {selectedParty.id}
                </p>
              </div>
              <button
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-50"
                onClick={() => setSelectedPartyId(null)}
              >
                닫기
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <section className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">서비스</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {selectedParty.service}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">방장</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {buildLeaderName(selectedParty.leaderId)}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">인원</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {selectedParty.memberCount}명
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">월 결제 금액</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {formatWon(selectedParty.monthlyAmount)}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  운영 리스크 요약
                </h3>
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    신고 누적 {selectedParty.reportCount}건
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    최근 결제 상태: {selectedParty.lastPayment}
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    현재 상태: {selectedParty.status}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  강제 종료 사유
                </h3>
                <textarea
                  value={closeReason}
                  onChange={(event) => setCloseReason(event.target.value)}
                  rows={5}
                  placeholder="정산 미납, 신고 누적, 서비스 정책 위반 등 종료 사유를 적어주세요."
                  className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none"
                />
              </section>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
              <p className="text-xs text-gray-400">
                강제 종료는 확인 모달에서 사유를 최종 검토한 뒤 실행합니다.
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  onClick={() => setSelectedPartyId(null)}
                >
                  닫기
                </button>
                <button
                  className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                  onClick={() => setConfirmingClose(true)}
                >
                  강제 종료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmingClose && selectedParty && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">
              파티 강제 종료 확인
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {buildPartyTitle(selectedParty.service, selectedParty.status)}{' '}
              파티를 종료 예정 상태로 변경합니다.
            </p>
            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              사유: {closeReason || '사유 미입력'}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                onClick={() => setConfirmingClose(false)}
              >
                취소
              </button>
              <button
                className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                onClick={handleForceClose}
              >
                종료 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
