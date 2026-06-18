// Calculate profile completion percentage
export function calculateProfileCompletion(user: {
  name?: string | null;
  avatar?: string | null;
  mobile?: string | null;
  state?: string | null;
  collegeName?: string | null;
  branch?: string | null;
  passingYear?: number | null;
  examTargets?: string[];
}): number {
  const fields = [
    { filled: !!user.name, weight: 15 },
    { filled: !!user.avatar, weight: 10 },
    { filled: !!user.mobile, weight: 15 },
    { filled: !!user.state, weight: 10 },
    { filled: !!user.collegeName, weight: 15 },
    { filled: !!user.branch, weight: 15 },
    { filled: !!user.passingYear, weight: 10 },
    { filled: (user.examTargets?.length ?? 0) > 0, weight: 10 },
  ];

  return fields.reduce((sum, f) => sum + (f.filled ? f.weight : 0), 0);
}
