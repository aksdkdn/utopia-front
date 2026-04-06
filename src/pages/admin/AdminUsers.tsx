import { useMemo, useState } from 'react';
import AdminHeader from './components/AdminHeader';
import FilterTabs from './components/FilterTabs';
import { adminUsersData } from './data/mockData';

const STATUS_STYLE: Record<string, string> = {
  정상: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  주의: 'bg-amber-50 text-amber-600 border-amber-100',
  정지: 'bg-red-50 text-red-600 border-red-100',
};

const FILTER_TABS = ['전체', '정상', '주의', '정지'];

function buildUserEmail(userId: string) {
  return `${userId}@partyup.dev`;
}

function getTrustReason(score: number, reportCount: number) {
  if (score < 50) return `신고 ${reportCount}건 누적, 즉시 검토 필요`;
  if (score < 75) return `최근 신고 증가, 상태 변경 후보`;
  return '최근 운영 리스크 없음';
}

function TrustBar({ score }: { score: number }) {
  const tone =
    score >= 85
      ? 'bg-emerald-500'
      : score >= 60
        ? 'bg-amber-500'
        : 'bg-red-500';

  return (
    <div className="min-w-[140px]">
      <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
        <span>신뢰도</span>
        <span className="font-semibold text-gray-700">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full ${tone}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState('전체');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(adminUsersData);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reviewMemo, setReviewMemo] = useState('');

  const filtered = useMemo(() => {
    let data = users;

    if (activeTab !== '전체') {
      data = data.filter((user) => user.status === activeTab);
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (user) =>
          user.id.toLowerCase().includes(q) ||
          user.nickname.toLowerCase().includes(q) ||
          user.status.toLowerCase().includes(q),
      );
    }

    return data;
  }, [activeTab, search, users]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const summary = useMemo(
    () => [
      { label: '전체 사용자', value: `${users.length}` },
      {
        label: '정상',
        value: `${users.filter((user) => user.status === '정상').length}`,
      },
      {
        label: '정지',
        value: `${users.filter((user) => user.status === '정지').length}`,
      },
      {
        label: '신뢰도 주의',
        value: `${users.filter((user) => user.trustScore < 75).length}`,
      },
    ],
    [users],
  );

  const updateUserStatus = (nextStatus: '정상' | '주의' | '정지') => {
    if (!selectedUser) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id ? { ...user, status: nextStatus } : user,
      ),
    );
  };

  return (
    <>
      <AdminHeader
        placeholder="사용자 검색 (ID/닉네임/상태)..."
        onSearch={setSearch}
        rightContent={
          <button className="rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
            신뢰도 정책
          </button>
        }
      />
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section>
            <h1 className="text-2xl font-bold text-gray-900">사용자관리</h1>
            <p className="mt-1 text-sm text-gray-500">
              사용자 상태, 신고 누적 수, 신뢰도를 기준으로 빠르게 대응할 수
              있도록 구성했습니다.
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
                      사용자
                    </th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                      상태
                    </th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                      신고 수
                    </th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                      참여 파티
                    </th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                      신뢰도
                    </th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                      최근 감점 사유
                    </th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-medium text-gray-900">
                          {user.nickname}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {buildUserEmail(user.id)}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          {user.id}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[user.status]}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {user.reportCount}건
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {user.partyCount}개
                      </td>
                      <td className="px-4 py-3.5">
                        <TrustBar score={user.trustScore} />
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {getTrustReason(user.trustScore, user.reportCount)}
                      </td>
                      <td className="px-4 py-3.5 text-sm">
                        <button
                          className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          상세 열기
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
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
              신고 누적이 높거나 신뢰도가 낮은 계정은 상태 변경 전에 상세 이력을
              먼저 확인할 수 있도록 버튼 구성을 분리했습니다.
            </div>
          </section>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="flex h-full w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold text-gray-400">
                  사용자 상세 패널
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedUser.nickname}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {buildUserEmail(selectedUser.id)} · {selectedUser.id}
                </p>
              </div>
              <button
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-50"
                onClick={() => setSelectedUserId(null)}
              >
                닫기
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <section className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">현재 상태</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {selectedUser.status}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">최근 활동</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {selectedUser.lastActive}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">신고 누적</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {selectedUser.reportCount}건
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">참여 파티</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {selectedUser.partyCount}개
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      신뢰도 상세
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      최근 감점 사유와 상태 변경 후보를 함께 확인합니다.
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedUser.trustScore}점
                  </span>
                </div>
                <div className="mt-4">
                  <TrustBar score={selectedUser.trustScore} />
                </div>
                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {getTrustReason(
                    selectedUser.trustScore,
                    selectedUser.reportCount,
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  운영 메모
                </h3>
                <textarea
                  value={reviewMemo}
                  onChange={(event) => setReviewMemo(event.target.value)}
                  rows={5}
                  placeholder="상태 변경 사유나 운영 메모를 남겨두세요."
                  className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none"
                />
              </section>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
              <p className="text-xs text-gray-400">
                상태 변경, 강제 정지, 메모 기록을 한 패널에서 함께 처리하도록
                구성했습니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  onClick={() => updateUserStatus('정상')}
                >
                  정상 전환
                </button>
                <button
                  className="rounded-md border border-amber-300 px-4 py-2 text-sm font-medium text-amber-600 transition hover:bg-amber-50"
                  onClick={() => updateUserStatus('주의')}
                >
                  상태 변경
                </button>
                <button
                  className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                  onClick={() => updateUserStatus('정지')}
                >
                  강제 정지
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
