import { GroupData } from '../utils/grouping';

interface GroupTheme {
  cardBg: string;
  cardBorder: string;
  headerBg: string;
  headerBorder: string;
  titleText: string;
  metaText: string;
  indexText: string;
  divider: string;
}

const GROUP_THEMES: GroupTheme[] = [
  {
    cardBg: 'bg-[#EFF6FF]',
    cardBorder: 'border-[#BFDBFE]',
    headerBg: 'bg-[#DBEAFE]',
    headerBorder: 'border-[#BFDBFE]',
    titleText: 'text-[#1E3A8A]',
    metaText: 'text-[#1D4ED8]',
    indexText: 'text-[#2563EB]',
    divider: 'border-[#DBEAFE]',
  },
  {
    cardBg: 'bg-[#ECFDF5]',
    cardBorder: 'border-[#A7F3D0]',
    headerBg: 'bg-[#D1FAE5]',
    headerBorder: 'border-[#A7F3D0]',
    titleText: 'text-[#064E3B]',
    metaText: 'text-[#047857]',
    indexText: 'text-[#059669]',
    divider: 'border-[#D1FAE5]',
  },
  {
    cardBg: 'bg-[#FFFBEB]',
    cardBorder: 'border-[#FDE68A]',
    headerBg: 'bg-[#FEF3C7]',
    headerBorder: 'border-[#FDE68A]',
    titleText: 'text-[#78350F]',
    metaText: 'text-[#B45309]',
    indexText: 'text-[#D97706]',
    divider: 'border-[#FEF3C7]',
  },
  {
    cardBg: 'bg-[#EEF2FF]',
    cardBorder: 'border-[#C7D2FE]',
    headerBg: 'bg-[#E0E7FF]',
    headerBorder: 'border-[#C7D2FE]',
    titleText: 'text-[#312E81]',
    metaText: 'text-[#4338CA]',
    indexText: 'text-[#4F46E5]',
    divider: 'border-[#E0E7FF]',
  },
  {
    cardBg: 'bg-[#FFF1F2]',
    cardBorder: 'border-[#FECDD3]',
    headerBg: 'bg-[#FFE4E6]',
    headerBorder: 'border-[#FECDD3]',
    titleText: 'text-[#881337]',
    metaText: 'text-[#BE123C]',
    indexText: 'text-[#E11D48]',
    divider: 'border-[#FFE4E6]',
  },
  {
    cardBg: 'bg-[#ECFEFF]',
    cardBorder: 'border-[#A5F3FC]',
    headerBg: 'bg-[#CFFAFE]',
    headerBorder: 'border-[#A5F3FC]',
    titleText: 'text-[#164E63]',
    metaText: 'text-[#0E7490]',
    indexText: 'text-[#0891B2]',
    divider: 'border-[#CFFAFE]',
  },
  {
    cardBg: 'bg-[#FAF5FF]',
    cardBorder: 'border-[#E9D5FF]',
    headerBg: 'bg-[#F3E8FF]',
    headerBorder: 'border-[#E9D5FF]',
    titleText: 'text-[#581C87]',
    metaText: 'text-[#7E22CE]',
    indexText: 'text-[#9333EA]',
    divider: 'border-[#F3E8FF]',
  },
  {
    cardBg: 'bg-[#F7FEE7]',
    cardBorder: 'border-[#D9F99D]',
    headerBg: 'bg-[#ECFCCB]',
    headerBorder: 'border-[#D9F99D]',
    titleText: 'text-[#365314]',
    metaText: 'text-[#4D7C0F]',
    indexText: 'text-[#65A30D]',
    divider: 'border-[#ECFCCB]',
  },
];

interface GroupCardProps {
  group: GroupData;
  colorIndex: number;
  projectorMode: boolean;
}

export function GroupCard({ group, colorIndex, projectorMode }: GroupCardProps) {
  const theme = GROUP_THEMES[colorIndex % GROUP_THEMES.length];

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border-[1.5px] transition-transform duration-150 ${theme.cardBg} ${theme.cardBorder}`}
    >
      <header
        className={`flex items-baseline justify-between gap-4 border-b px-6 py-4 ${theme.headerBg} ${theme.headerBorder}`}
      >
        <h3
          className={`font-bold tracking-tight ${theme.titleText} ${
            projectorMode ? 'text-3xl' : 'text-2xl'
          }`}
        >
          {group.name}
        </h3>
        <span
          className={`font-mono font-semibold tabular-nums whitespace-nowrap shrink-0 ${theme.metaText} ${
            projectorMode ? 'text-lg' : 'text-base'
          }`}
        >
          {group.members.length} thành viên
        </span>
      </header>

      <ol className="flex flex-col divide-y px-6 py-3">
        {group.members.map((member, index) => (
          <li
            key={`${group.id}-${index}-${member}`}
            className={`flex items-baseline gap-3.5 py-2.5 ${theme.divider}`}
          >
            <span
              className={`font-mono font-semibold tabular-nums select-none shrink-0 ${theme.indexText} ${
                projectorMode ? 'text-lg w-7' : 'text-base w-6'
              }`}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              className={`font-semibold text-slate-900 leading-snug break-words ${
                projectorMode ? 'text-2xl' : 'text-xl'
              }`}
            >
              {member}
            </span>
          </li>
        ))}
      </ol>
    </article>
  );
}
