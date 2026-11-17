import { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCw,
  Shuffle,
} from 'lucide-react';
import { GroupCard } from './components/GroupCard';
import {
  formatGroupsForClipboard,
  generateBalancedGroups,
  GroupData,
  INITIAL_SAMPLE_GROUPS,
  parseStudentNames,
  SAMPLE_STUDENTS_TEXT,
  SplitMode,
} from './utils/grouping';

export default function App() {
  const [rawInput, setRawInput] = useState<string>(SAMPLE_STUDENTS_TEXT);
  const [splitMode, setSplitMode] = useState<SplitMode>('by-groups');
  const [countInput, setCountInput] = useState<number>(4);
  const [groups, setGroups] = useState<GroupData[]>(INITIAL_SAMPLE_GROUPS);
  const [isSampleState, setIsSampleState] = useState<boolean>(true);
  const [projectorMode, setProjectorMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [shuffleKey, setShuffleKey] = useState<number>(0);

  const parsedStudents = useMemo(() => parseStudentNames(rawInput), [rawInput]);

  const previewSummary = useMemo(() => {
    const total = parsedStudents.length;
    if (total === 0) {
      return 'Chưa có sinh viên trong danh sách.';
    }
    const safeVal = Math.max(1, Math.floor(Number.isFinite(countInput) ? countInput : 1));
    const numGroups =
      splitMode === 'by-groups'
        ? Math.min(safeVal, total)
        : Math.max(1, Math.ceil(total / safeVal));

    const minSize = Math.floor(total / numGroups);
    const maxSize = Math.ceil(total / numGroups);
    const rangeLabel =
      minSize === maxSize ? `${minSize} người/nhóm` : `${minSize}–${maxSize} người/nhóm`;

    return `Dự kiến: ${numGroups} nhóm (${rangeLabel})`;
  }, [parsedStudents.length, splitMode, countInput]);

  const resultStats = useMemo(() => {
    if (groups.length === 0) {
      return { totalMembers: 0, minSize: 0, maxSize: 0 };
    }
    const sizes = groups.map((g) => g.members.length);
    const totalMembers = sizes.reduce((acc, s) => acc + s, 0);
    return {
      totalMembers,
      minSize: Math.min(...sizes),
      maxSize: Math.max(...sizes),
    };
  }, [groups]);

  const handleModeChange = (nextMode: SplitMode) => {
    setSplitMode(nextMode);
    setErrorMessage(null);
    if (nextMode === 'by-groups' && countInput < 1) {
      setCountInput(4);
    }
    if (nextMode === 'by-size' && countInput < 1) {
      setCountInput(4);
    }
  };

  const handleCountChange = (nextValue: number) => {
    if (!Number.isFinite(nextValue)) {
      setCountInput(1);
      return;
    }
    setCountInput(Math.max(1, Math.min(200, Math.floor(nextValue))));
  };

  const handleSplitGroups = (avoidPrevious: boolean) => {
    if (parsedStudents.length === 0) {
      setErrorMessage('Danh sách đang trống. Vui lòng dán ít nhất một tên sinh viên.');
      return;
    }

    setErrorMessage(null);
    setCopyStatus('idle');
    const nextGroups = generateBalancedGroups(
      parsedStudents,
      splitMode,
      countInput,
      avoidPrevious ? groups : undefined
    );
    setGroups(nextGroups);
    setIsSampleState(false);
    setShuffleKey((prev) => prev + 1);
  };

  const handleCopyResults = async () => {
    if (groups.length === 0) return;

    const text = formatGroupsForClipboard(groups);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = text;
        tempTextarea.setAttribute('readonly', '');
        tempTextarea.style.position = 'fixed';
        tempTextarea.style.opacity = '0';
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(tempTextarea);
        if (!success) {
          throw new Error('Copy failed');
        }
      }
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 2400);
    } catch {
      setCopyStatus('error');
      window.setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  const handleLoadSample = () => {
    setRawInput(SAMPLE_STUDENTS_TEXT);
    setSplitMode('by-groups');
    setCountInput(4);
    setGroups(INITIAL_SAMPLE_GROUPS);
    setIsSampleState(true);
    setErrorMessage(null);
    setCopyStatus('idle');
  };

  const handleClearList = () => {
    setRawInput('');
    setErrorMessage(null);
  };

  const gridColsClass = useMemo(() => {
    if (projectorMode) {
      if (groups.length <= 2) return 'grid-cols-1 md:grid-cols-2';
      if (groups.length <= 4) return 'grid-cols-1 md:grid-cols-2';
      if (groups.length <= 6) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
    if (groups.length >= 6) {
      return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
    }
    return 'grid-cols-1 md:grid-cols-2';
  }, [groups.length, projectorMode]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl whitespace-nowrap shrink-0">
            Chia Nhóm Lớp Học
          </h1>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2.5 text-sm font-medium text-slate-600 whitespace-nowrap">
              <span className="font-mono tabular-nums text-slate-900 font-semibold">
                {parsedStudents.length}
              </span>
              <span>sinh viên</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="font-mono tabular-nums text-slate-900 font-semibold">
                {groups.length}
              </span>
              <span>nhóm</span>
            </div>

            <button
              type="button"
              onClick={() => setProjectorMode((prev) => !prev)}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap shrink-0"
            >
              {projectorMode ? (
                <>
                  <Minimize2 className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  <span>Hiện khung nhập</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  <span>Chế độ chiếu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-start">
        {!projectorMode && (
          <section
            aria-label="Nhập danh sách và tùy chọn chia nhóm"
            className="w-full rounded-2xl border border-slate-200 bg-white p-6 lg:w-[410px] xl:w-[440px] lg:shrink-0"
          >
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <label
                    htmlFor="student-list-input"
                    className="text-lg font-bold text-slate-900"
                  >
                    Danh sách sinh viên
                  </label>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="text-blue-700 hover:text-blue-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap"
                    >
                      Nạp mẫu
                    </button>
                    <span aria-hidden="true" className="text-slate-300">
                      /
                    </span>
                    <button
                      type="button"
                      onClick={handleClearList}
                      className="text-slate-600 hover:text-slate-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap"
                    >
                      Xóa hết
                    </button>
                  </div>
                </div>

                <p className="mt-1 text-sm text-slate-600">
                  Dán danh sách tên, mỗi dòng một người. Các dòng trống sẽ tự động được bỏ qua.
                </p>

                <textarea
                  id="student-list-input"
                  value={rawInput}
                  onChange={(e) => {
                    setRawInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={'Nguyễn Minh Anh\nTrần Quốc Bảo\nLê Thảo Chi\nPhạm Đức Dũng'}
                  rows={11}
                  className="mt-3 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-medium leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />

                <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                  <span>
                    Đã nhận diện{' '}
                    <strong className="font-mono font-semibold tabular-nums text-slate-900">
                      {parsedStudents.length}
                    </strong>{' '}
                    sinh viên hợp lệ
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <span className="block text-sm font-semibold text-slate-700">
                  Cách thức chia nhóm
                </span>
                <div
                  role="radiogroup"
                  aria-label="Cách thức chia nhóm"
                  className="mt-2 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1.5"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={splitMode === 'by-groups'}
                    onClick={() => handleModeChange('by-groups')}
                    className={`min-h-[42px] rounded-lg px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                      splitMode === 'by-groups'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Theo số nhóm
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={splitMode === 'by-size'}
                    onClick={() => handleModeChange('by-size')}
                    className={`min-h-[42px] rounded-lg px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                      splitMode === 'by-size'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Theo số người / nhóm
                  </button>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="group-count-input"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    {splitMode === 'by-groups'
                      ? 'Số lượng nhóm muốn chia'
                      : 'Số thành viên mỗi nhóm'}
                  </label>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Giảm số lượng"
                      onClick={() => handleCountChange(countInput - 1)}
                      disabled={countInput <= 1}
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                      <Minus className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <input
                      id="group-count-input"
                      type="number"
                      min={1}
                      max={200}
                      value={countInput}
                      onChange={(e) => handleCountChange(Number(e.target.value))}
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-center font-mono text-xl font-bold tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />

                    <button
                      type="button"
                      aria-label="Tăng số lượng"
                      onClick={() => handleCountChange(countInput + 1)}
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                    >
                      <Plus className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    {previewSummary}
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
                >
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => handleSplitGroups(false)}
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-blue-700 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-blue-800 active:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap"
                >
                  <Shuffle className="h-5 w-5" aria-hidden="true" />
                  <span>Chia nhóm</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSplitGroups(true)}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap"
                  >
                    <RotateCw className="h-4 w-4 text-slate-600" aria-hidden="true" />
                    <span>Chia lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyResults}
                    disabled={groups.length === 0}
                    className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap ${
                      copyStatus === 'copied'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : copyStatus === 'error'
                        ? 'border-rose-300 bg-rose-50 text-rose-800'
                        : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {copyStatus === 'copied' ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                        <span>Đã sao chép!</span>
                      </>
                    ) : copyStatus === 'error' ? (
                      <span>Lỗi sao chép</span>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-slate-600" aria-hidden="true" />
                        <span>Sao chép kết quả</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section aria-label="Kết quả chia nhóm" className="flex-1 min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2
                className={`font-bold tracking-tight text-slate-900 ${
                  projectorMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
                }`}
              >
                Kết quả chia nhóm
              </h2>
              <div
                className={`mt-1.5 flex flex-wrap items-center gap-2 font-medium text-slate-600 ${
                  projectorMode ? 'text-lg' : 'text-base'
                }`}
              >
                {isSampleState && (
                  <>
                    <span className="font-semibold text-blue-700">4 nhóm mẫu</span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                  </>
                )}
                <span>
                  <strong className="font-mono tabular-nums text-slate-900">
                    {groups.length}
                  </strong>{' '}
                  nhóm
                </span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span>
                  <strong className="font-mono tabular-nums text-slate-900">
                    {resultStats.totalMembers}
                  </strong>{' '}
                  sinh viên
                </span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span>
                  {resultStats.minSize === resultStats.maxSize
                    ? `Mỗi nhóm ${resultStats.minSize} người`
                    : `${resultStats.minSize}–${resultStats.maxSize} người/nhóm (chênh tối đa 1)`}
                </span>
              </div>
            </div>

            {projectorMode && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSplitGroups(true)}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap"
                >
                  <RotateCw className="h-4 w-4" aria-hidden="true" />
                  <span>Chia lại</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyResults}
                  className={`inline-flex min-h-[46px] items-center gap-2 rounded-xl border px-5 py-2.5 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap ${
                    copyStatus === 'copied'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {copyStatus === 'copied' ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                      <span>Đã sao chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-600" aria-hidden="true" />
                      <span>Sao chép kết quả</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {groups.length > 0 ? (
            <div key={shuffleKey} className={`grid gap-5 sm:gap-6 ${gridColsClass}`}>
              {groups.map((group, index) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  colorIndex={index}
                  projectorMode={projectorMode}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <p className="text-xl font-semibold text-slate-800">
                Chưa có nhóm nào được tạo
              </p>
              <p className="mt-2 text-base text-slate-600">
                Hãy dán danh sách tên sinh viên ở khung bên trái rồi nhấn &ldquo;Chia nhóm&rdquo;.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
