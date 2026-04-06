import { useMemo, useState } from 'react';
import AdminHeader from './components/AdminHeader';
import { systemLogsData } from './data/mockData';

const TYPE_COLOR: Record<string, string> = {
  ERROR: 'text-red-500',
  ADMIN_ACTION: 'text-blue-500',
  SYSTEM: 'text-gray-500',
};

const TYPE_TABS = ['전체', 'ERROR', 'ADMIN_ACTION', 'SYSTEM'];
const DATE_TABS = ['전체', '오늘', '최근 3일', '최근 7일'];

function parseTimestamp(value: string) {
  return new Date(value.replace(' ', 'T'));
}

export default function AdminSystemLogs() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('전체');
  const [activeDate, setActiveDate] = useState('전체');
  const [activeActor, setActiveActor] = useState('전체');

  const actors = useMemo(
    () => [
      '전체',
      ...Array.from(new Set(systemLogsData.map((log) => log.actor))),
    ],
    [],
  );

  const latestTimestamp = useMemo(
    () =>
      systemLogsData.reduce((latest, current) =>
        parseTimestamp(current.timestamp) > parseTimestamp(latest.timestamp)
          ? current
          : latest,
      ).timestamp,
    [],
  );

  const filtered = useMemo(() => {
    const latestDate = parseTimestamp(latestTimestamp);

    return systemLogsData.filter((log) => {
      const timestamp = parseTimestamp(log.timestamp);
      const q = search.toLowerCase();

      if (activeType !== '전체' && log.type !== activeType) {
        return false;
      }

      if (activeActor !== '전체' && log.actor !== activeActor) {
        return false;
      }

      if (activeDate === '오늘') {
        if (latestDate.toDateString() !== timestamp.toDateString())
          return false;
      } else if (activeDate === '최근 3일') {
        if (
          latestDate.getTime() - timestamp.getTime() >
          3 * 24 * 60 * 60 * 1000
        ) {
          return false;
        }
      } else if (activeDate === '최근 7일') {
        if (
          latestDate.getTime() - timestamp.getTime() >
          7 * 24 * 60 * 60 * 1000
        ) {
          return false;
        }
      }

      if (!q) return true;

      return (
        log.type.toLowerCase().includes(q) ||
        log.message.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q)
      );
    });
  }, [activeActor, activeDate, activeType, latestTimestamp, search]);

  const summary = useMemo(
    () => [
      {
        label: 'ERROR',
        value: `${systemLogsData.filter((log) => log.type === 'ERROR').length}`,
      },
      {
        label: 'ADMIN_ACTION',
        value: `${systemLogsData.filter((log) => log.type === 'ADMIN_ACTION').length}`,
      },
      {
        label: 'SYSTEM',
        value: `${systemLogsData.filter((log) => log.type === 'SYSTEM').length}`,
      },
    ],
    [],
  );

  return (
    <>
      <AdminHeader
        placeholder="로그 검색 (키워드/관리자/유저)..."
        onSearch={setSearch}
        rightContent={
          <button className="rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
            Export
          </button>
        }
      />
      <div className="p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section>
            <h1 className="mb-1 text-2xl font-bold">시스템 로그</h1>
            <p className="text-sm text-gray-500">
              에러 로그, 관리자 액션, 시스템 이벤트를 타입과 날짜 기준으로
              빠르게 필터링할 수 있게 구성했습니다.
            </p>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
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

          <div className="flex flex-wrap items-center gap-3">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  activeType === tab
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 bg-white text-gray-500 hover:border-blue-300 hover:text-blue-500'
                }`}
                onClick={() => setActiveType(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {DATE_TABS.map((tab) => (
              <button
                key={tab}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  activeDate === tab
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400 hover:text-gray-700'
                }`}
                onClick={() => setActiveDate(tab)}
              >
                {tab}
              </button>
            ))}

            <select
              value={activeActor}
              onChange={(event) => setActiveActor(event.target.value)}
              className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-600 outline-none"
            >
              {actors.map((actor) => (
                <option key={actor} value={actor}>
                  {actor}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    시간
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    유형
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    내용
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                    주체
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <span
                        className={`font-semibold ${TYPE_COLOR[log.type] ?? 'text-gray-500'}`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm">{log.message}</td>
                    <td className="px-4 py-3.5 text-sm">{log.actor}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
              ERROR / ADMIN_ACTION / SYSTEM 필터와 날짜 범위를 같이 보면서 운영
              이력을 추적하도록 구성했습니다.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
