import AdminHeader from './components/AdminHeader';
import {
  dashboardMetricsData,
  receiptsData,
  reportsData,
  settlementsData,
  systemLogsData,
} from './data/mockData';

const HOURLY_TREND = [
  { hour: '00', value: 1 },
  { hour: '04', value: 3 },
  { hour: '08', value: 5 },
  { hour: '12', value: 4 },
  { hour: '16', value: 6 },
  { hour: '20', value: 2 },
];

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
        {value}
      </p>
      <p className="mt-2 text-xs text-gray-400">{helper}</p>
    </article>
  );
}

export default function AdminDashboard() {
  const todayReports = reportsData.filter(
    (report) => report.status === '접수' || report.status === 'AI처리',
  ).length;
  const waitingSettlements = settlementsData.filter(
    (settlement) => settlement.status === '대기',
  ).length;
  const waitingReceipts = receiptsData.filter(
    (receipt) => receipt.status === '대기',
  ).length;
  const captchaFailures = systemLogsData.filter((log) =>
    log.message.includes('캡챠'),
  ).length;
  const todaySignups =
    dashboardMetricsData.find((metric) => metric.id === 'today')?.value ?? '+0';

  const topMetrics = [
    {
      id: 'today-reports',
      label: '오늘 신고',
      value: `${todayReports}건`,
      helper: '접수 + AI처리 상태 기준',
    },
    {
      id: 'waiting-settlements',
      label: '정산 대기',
      value: `${waitingSettlements}건`,
      helper: '승인 전 검토가 필요한 정산 건',
    },
    {
      id: 'waiting-receipts',
      label: '영수증 대기',
      value: `${waitingReceipts}건`,
      helper: 'OCR 확인 후 승인해야 하는 영수증',
    },
    {
      id: 'captcha-failures',
      label: '캡챠 실패',
      value: `${captchaFailures}건`,
      helper: '최근 운영 로그에 기록된 실패 건수',
    },
    {
      id: 'today-signups',
      label: '신규 가입',
      value: todaySignups,
      helper: '오늘 00:00 이후 가입 완료',
    },
  ];

  const urgentItems = [
    ...reportsData
      .filter(
        (report) => report.status === '접수' || report.status === 'AI처리',
      )
      .map((report) => ({
        id: report.id,
        type: '신고',
        title: `${report.type} 신고 검토`,
        target: report.target,
        helper: `${report.reason} / ${report.createdAt}`,
      })),
    ...receiptsData
      .filter((receipt) => receipt.status === '대기')
      .map((receipt) => ({
        id: receipt.id,
        type: '영수증',
        title: `${receipt.partyId} 영수증 승인`,
        target: receipt.userId,
        helper: `OCR ${receipt.ocrAmount.toLocaleString()}원 / ${receipt.createdAt}`,
      })),
    ...settlementsData
      .filter((settlement) => settlement.status === '대기')
      .map((settlement) => ({
        id: settlement.id,
        type: '정산',
        title: `${settlement.partyId} 정산 검토`,
        target: settlement.leaderId,
        helper: `${settlement.billingMonth} / ${settlement.totalAmount.toLocaleString()}원`,
      })),
  ].slice(0, 6);

  const maxTrend = Math.max(...HOURLY_TREND.map((item) => item.value), 1);

  return (
    <>
      <AdminHeader
        placeholder="관리자 검색..."
        rightContent={
          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            최근 5분 기준 갱신
          </span>
        }
      />
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section>
            <h1 className="text-2xl font-bold text-gray-900">통계 대시보드</h1>
            <p className="mt-1 text-sm text-gray-500">
              오늘 우선 처리해야 할 신고, 승인 대기, 장애성 이벤트만 빠르게 보는
              운영형 대시보드입니다.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {topMetrics.map((metric) => (
              <MetricCard
                key={metric.id}
                label={metric.label}
                value={metric.value}
                helper={metric.helper}
              />
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    최근 24시간 추이
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    신고/승인/장애 이벤트가 몰리는 시간대를 빠르게 확인합니다.
                  </p>
                </div>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500">
                  6개 시점 요약
                </span>
              </div>
              <div className="mt-6 flex h-64 items-end gap-4">
                {HOURLY_TREND.map((item) => (
                  <div
                    key={item.hour}
                    className="flex flex-1 flex-col items-center"
                  >
                    <div className="mb-2 text-xs font-semibold text-gray-500">
                      {item.value}
                    </div>
                    <div className="flex h-48 w-full items-end rounded-2xl bg-gray-50 px-2 pb-2">
                      <div
                        className="w-full rounded-xl bg-blue-500"
                        style={{
                          height: `${Math.max((item.value / maxTrend) * 100, 14)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      {item.hour}:00
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    긴급 처리 리스트
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    신고, 영수증, 정산 대기 건을 한 화면에서 우선순위로
                    확인합니다.
                  </p>
                </div>
                <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                  즉시 확인
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {urgentItems.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.target} · {item.helper}
                        </p>
                      </div>
                      <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600">
                        {item.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      </div>
    </>
  );
}
