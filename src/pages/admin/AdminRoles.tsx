import { useEffect, useMemo, useState } from 'react';
import AdminHeader from './components/AdminHeader';
import FilterTabs from './components/FilterTabs';
import { adminRolesData } from './data/mockData';

const ROLE_STYLE: Record<string, string> = {
  ROOT: 'bg-red-50 text-red-600 border-red-100',
  OPS: 'bg-blue-50 text-blue-600 border-blue-100',
  CS: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const FILTER_TABS = ['전체', 'ROOT', 'OPS', 'CS'];

const ROLE_GUIDE = [
  {
    role: 'ROOT',
    description: '전체 정책 변경, 관리자 권한 편집, 중요 승인 처리',
  },
  { role: 'OPS', description: '신고/정산/영수증 운영과 실시간 검토 처리' },
  { role: 'CS', description: '사용자 문의, 파티 관리, 제한적 조회 중심 권한' },
];

const DEFAULT_PERMISSIONS: Record<'ROOT' | 'OPS' | 'CS', string[]> = {
  ROOT: [
    '사용자 상태 변경',
    '권한 편집',
    '신고 처리',
    '영수증 승인',
    '정산 승인',
    '시스템 로그 조회',
  ],
  OPS: ['신고 처리', '영수증 승인', '정산 승인', '시스템 로그 조회'],
  CS: ['사용자 조회', '파티 관리', '신고 조회', '운영 메모 기록'],
};

const PERMISSION_OPTIONS = [
  '사용자 조회',
  '사용자 상태 변경',
  '파티 관리',
  '신고 조회',
  '신고 처리',
  '영수증 승인',
  '정산 승인',
  '권한 편집',
  '시스템 로그 조회',
  '운영 메모 기록',
];

const EMPTY_PERMISSIONS: string[] = [];

function PermissionTag({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
        enabled
          ? 'border-blue-100 bg-blue-50 text-blue-600'
          : 'border-gray-200 bg-gray-50 text-gray-400'
      }`}
    >
      <span>{enabled ? '☑' : '☐'}</span>
      {label}
    </span>
  );
}

export default function AdminRoles() {
  const [activeTab, setActiveTab] = useState('전체');
  const [search, setSearch] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(
    adminRolesData[0]?.id ?? null,
  );
  const [permissionMap, setPermissionMap] = useState<Record<string, string[]>>(
    () =>
      Object.fromEntries(
        adminRolesData.map((role) => [
          role.id,
          [...DEFAULT_PERMISSIONS[role.role]],
        ]),
      ),
  );
  const [draftPermissions, setDraftPermissions] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let data = adminRolesData;

    if (activeTab !== '전체') {
      data = data.filter((role) => role.role === activeTab);
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (role) =>
          role.adminId.toLowerCase().includes(q) ||
          role.role.toLowerCase().includes(q) ||
          role.scope.toLowerCase().includes(q),
      );
    }

    return data;
  }, [activeTab, search]);

  const selectedRole = useMemo(
    () => adminRolesData.find((role) => role.id === selectedRoleId) ?? null,
    [selectedRoleId],
  );

  const savedPermissions = useMemo(() => {
    if (!selectedRole) {
      return EMPTY_PERMISSIONS;
    }

    return (
      permissionMap[selectedRole.id] ?? DEFAULT_PERMISSIONS[selectedRole.role]
    );
  }, [permissionMap, selectedRole]);

  useEffect(() => {
    setDraftPermissions((prev) => {
      if (
        prev.length === savedPermissions.length &&
        prev.every(
          (permission, index) => permission === savedPermissions[index],
        )
      ) {
        return prev;
      }

      return [...savedPermissions];
    });
  }, [savedPermissions]);

  const permissionDiff = useMemo(() => {
    const added = draftPermissions.filter(
      (item) => !savedPermissions.includes(item),
    );
    const removed = savedPermissions.filter(
      (item) => !draftPermissions.includes(item),
    );
    return { added, removed };
  }, [draftPermissions, savedPermissions]);

  const roleSummary = useMemo(
    () => [
      { label: '전체 관리자', value: `${adminRolesData.length}` },
      {
        label: 'ROOT',
        value: `${adminRolesData.filter((role) => role.role === 'ROOT').length}`,
      },
      {
        label: 'OPS',
        value: `${adminRolesData.filter((role) => role.role === 'OPS').length}`,
      },
      {
        label: 'CS',
        value: `${adminRolesData.filter((role) => role.role === 'CS').length}`,
      },
    ],
    [],
  );

  const handleTogglePermission = (permission: string) => {
    setDraftPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((item) => item !== permission)
        : [...prev, permission],
    );
  };

  const handleSave = () => {
    if (!selectedRole) return;

    setPermissionMap((prev) => ({
      ...prev,
      [selectedRole.id]: [...draftPermissions].sort(),
    }));
  };

  return (
    <>
      <AdminHeader
        placeholder="권한 검색 (관리자 ID/역할/범위)..."
        onSearch={setSearch}
        rightContent={
          <button
            className="rounded-md border border-blue-500 bg-blue-500 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            onClick={() => setSelectedRoleId(adminRolesData[0]?.id ?? null)}
          >
            관리자 추가
          </button>
        }
      />
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section>
            <h1 className="text-2xl font-bold text-gray-900">권한관리</h1>
            <p className="mt-1 text-sm text-gray-500">
              관리자 역할과 접근 범위를 확인하고 최소 권한 원칙으로 운영합니다.
            </p>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {roleSummary.map((item) => (
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

          <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1.8fr)_320px]">
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                        관리자
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                        역할
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                        권한 체크리스트
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                        최근 수정
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                        수정자
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-500">
                        편집
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((role) => {
                      const permissions =
                        permissionMap[role.id] ??
                        DEFAULT_PERMISSIONS[role.role];

                      return (
                        <tr
                          key={role.id}
                          className="border-b border-gray-100 transition hover:bg-gray-50"
                        >
                          <td className="px-4 py-3.5 text-sm font-medium text-gray-900">
                            <div>{role.adminId}</div>
                            <div className="mt-1 text-xs text-gray-400">
                              {role.scope}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${ROLE_STYLE[role.role]}`}
                            >
                              {role.role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">
                            <div className="flex flex-wrap gap-1.5">
                              {PERMISSION_OPTIONS.slice(0, 4).map(
                                (permission) => (
                                  <PermissionTag
                                    key={`${role.id}-${permission}`}
                                    label={permission}
                                    enabled={permissions.includes(permission)}
                                  />
                                ),
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">
                            {role.lastUpdated}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">
                            {role.updatedBy}
                          </td>
                          <td className="px-4 py-3.5 text-sm">
                            <button
                              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                              onClick={() => setSelectedRoleId(role.id)}
                            >
                              권한 편집
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
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
                표에서는 핵심 권한만 요약하고, 세부 권한은 우측 편집 패널에서
                조정할 수 있도록 분리했습니다.
              </div>
            </section>

            <div className="space-y-4">
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900">
                  역할(Role) 가이드
                </h2>
                <div className="mt-4 space-y-3">
                  {ROLE_GUIDE.map((item) => (
                    <div
                      key={item.role}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {item.role}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900">
                  최소 권한 원칙
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-gray-500">
                  <li>관리자 추가 시 기본 역할은 OPS 또는 CS로 시작합니다.</li>
                  <li>권한 변경 이력은 모두 시스템 로그와 함께 남겨 둡니다.</li>
                  <li>
                    민감 기능은 ROOT 계정에서만 접근 가능하도록 제한합니다.
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>

      {selectedRole && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="flex h-full w-full max-w-xl flex-col border-l border-gray-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold text-gray-400">
                  권한 편집 패널
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedRole.adminId}
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${ROLE_STYLE[selectedRole.role]}`}
                  >
                    {selectedRole.role}
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedRole.scope}
                  </span>
                </div>
              </div>
              <button
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-50"
                onClick={() => setSelectedRoleId(null)}
              >
                닫기
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <section>
                <h3 className="text-sm font-semibold text-gray-900">
                  권한 토글
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  역할 설명과 실제 접근 권한을 연결해서 운영자가 바로 점검할 수
                  있게 구성했습니다.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {PERMISSION_OPTIONS.map((permission) => {
                    const checked = draftPermissions.includes(permission);

                    return (
                      <label
                        key={permission}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                          checked
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleTogglePermission(permission)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="font-medium">{permission}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  저장 전 변경 diff
                </h3>
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <p className="font-medium text-emerald-600">추가될 권한</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {permissionDiff.added.length > 0 ? (
                        permissionDiff.added.map((permission) => (
                          <span
                            key={permission}
                            className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600"
                          >
                            + {permission}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          추가되는 권한이 없습니다.
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-red-500">제거될 권한</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {permissionDiff.removed.length > 0 ? (
                        permissionDiff.removed.map((permission) => (
                          <span
                            key={permission}
                            className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-500"
                          >
                            - {permission}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          제거되는 권한이 없습니다.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
              <p className="text-xs text-gray-400">
                권한 변경 시 실제 운영 환경에서는 감사 로그를 함께 남기도록
                연결하면 됩니다.
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  onClick={() => setDraftPermissions([...savedPermissions])}
                >
                  변경 취소
                </button>
                <button
                  className="rounded-md border border-blue-500 bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                  onClick={handleSave}
                >
                  권한 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
