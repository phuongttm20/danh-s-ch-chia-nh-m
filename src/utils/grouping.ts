export type SplitMode = 'by-groups' | 'by-size';

export interface GroupData {
  id: number;
  name: string;
  members: string[];
}

export const SAMPLE_STUDENT_NAMES: string[] = [
  'Nguyễn Minh Anh',
  'Trần Quốc Bảo',
  'Lê Thảo Chi',
  'Phạm Đức Dũng',
  'Hoàng Gia Hân',
  'Vũ Nhật Huy',
  'Đặng Khánh Linh',
  'Bùi Tuấn Kiệt',
  'Đỗ Ngọc Mai',
  'Ngô Thanh Nam',
  'Dương Phương Nhi',
  'Lý Quang Phúc',
  'Trương Bảo Quyên',
  'Phan Hoàng Sơn',
  'Võ Thùy Trang',
  'Hồ Anh Tuấn',
];

export const SAMPLE_STUDENTS_TEXT = SAMPLE_STUDENT_NAMES.join('\n');

export const INITIAL_SAMPLE_GROUPS: GroupData[] = [
  {
    id: 1,
    name: 'Nhóm 1',
    members: SAMPLE_STUDENT_NAMES.slice(0, 4),
  },
  {
    id: 2,
    name: 'Nhóm 2',
    members: SAMPLE_STUDENT_NAMES.slice(4, 8),
  },
  {
    id: 3,
    name: 'Nhóm 3',
    members: SAMPLE_STUDENT_NAMES.slice(8, 12),
  },
  {
    id: 4,
    name: 'Nhóm 4',
    members: SAMPLE_STUDENT_NAMES.slice(12, 16),
  },
];

export function parseStudentNames(rawText: string): string[] {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getGroupingSignature(groups: GroupData[]): string {
  return groups
    .map((g) => [...g.members].sort((a, b) => a.localeCompare(b, 'vi')).join('|'))
    .sort()
    .join('||');
}

export function generateBalancedGroups(
  students: string[],
  mode: SplitMode,
  value: number,
  previousGroups?: GroupData[]
): GroupData[] {
  if (students.length === 0) {
    return [];
  }

  const safeValue = Math.max(1, Math.floor(Number.isFinite(value) ? value : 1));
  const numGroups =
    mode === 'by-groups'
      ? Math.min(safeValue, students.length)
      : Math.max(1, Math.ceil(students.length / safeValue));

  const buildGroups = (): GroupData[] => {
    const shuffled = shuffleArray(students);
    const baseSize = Math.floor(shuffled.length / numGroups);
    const remainder = shuffled.length % numGroups;

    const groups: GroupData[] = [];
    let cursor = 0;

    for (let i = 0; i < numGroups; i++) {
      const size = baseSize + (i < remainder ? 1 : 0);
      groups.push({
        id: i + 1,
        name: `Nhóm ${i + 1}`,
        members: shuffled.slice(cursor, cursor + size),
      });
      cursor += size;
    }

    return groups;
  };

  let candidate = buildGroups();

  if (previousGroups && previousGroups.length > 0 && students.length >= 2 && numGroups >= 2) {
    const prevSignature = getGroupingSignature(previousGroups);
    let attempts = 0;
    while (getGroupingSignature(candidate) === prevSignature && attempts < 12) {
      candidate = buildGroups();
      attempts++;
    }
  }

  return candidate;
}

export function formatGroupsForClipboard(groups: GroupData[]): string {
  return groups
    .map((group) => {
      const header = `${group.name} (${group.members.length} sinh viên):`;
      const lines = group.members.map((member, index) => `${index + 1}. ${member}`);
      return [header, ...lines].join('\n');
    })
    .join('\n\n');
}
