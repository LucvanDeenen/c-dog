export function percentComplete(percent: number): string {
  if (percent < 20) return "bg-red-800 text-white";
  if (percent < 40) return "bg-orange-500 text-black";
  if (percent < 60) return "bg-yellow-600 text-black";
  if (percent < 80) return "bg-lime-500 text-black";
  if (percent < 99) return "bg-green-700 text-black"
  return "bg-green-600 text-black";
}