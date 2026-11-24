import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BatteryMedium,
  Bell,
  Bike,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  FlaskConical,
  Focus,
  LayoutGrid,
  Leaf,
  LogOut,
  Map,
  MapPin,
  Menu,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  SquareParking,
  Sun,
  TriangleAlert,
  Truck,
  UserRound,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Explicit imports keep unused Lucide icons out of the production bundle.
const icons: Record<string, LucideIcon> = {
  activity: Activity,
  alert: TriangleAlert,
  arrow: ArrowRight,
  "arrow-left": ArrowLeft,
  "arrow-up": ArrowUp,
  battery: BatteryMedium,
  bell: Bell,
  bike: Bike,
  bolt: Zap,
  check: Check,
  chevron: ChevronRight,
  close: X,
  clock: Clock3,
  dispatch: Truck,
  flask: FlaskConical,
  focus: Focus,
  grid: LayoutGrid,
  help: CircleHelp,
  leaf: Leaf,
  logout: LogOut,
  map: Map,
  menu: Menu,
  parking: SquareParking,
  pin: MapPin,
  plus: Plus,
  refresh: RefreshCw,
  search: Search,
  settings: SlidersHorizontal,
  sun: Sun,
  user: UserRound,
};

type IconProps = { name: string; size?: number; strokeWidth?: number };

export function Icon({ name, size = 20, strokeWidth = 1.75 }: IconProps) {
  const Glyph = icons[name] ?? LayoutGrid;

  return (
    <Glyph
      data-icon={name}
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      focusable="false"
    />
  );
}
